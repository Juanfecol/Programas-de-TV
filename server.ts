import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Transcoding API endpoint
  app.get("/api/video", (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).send("Missing url parameter");
    }

    console.log(`Starting transcoding for URL: ${videoUrl}`);

    // Set proper headers for streaming MP4
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "none");

    // Spawn ffmpeg to transcode AVI to fragmented MP4 stream
    // -i [input]: read the AVI file from remote URL
    // -c:v libx264: encode to standard H.264 video
    // -preset ultrafast: minimize container CPU usage
    // -crf 28: balance between compression and quality
    // -c:a aac: encode audio to standard AAC
    // -b:a 128k: audio quality
    // -f mp4: output container must be MP4
    // -movflags frag_keyframe+empty_moov: format for fragmented, non-seekable chunked streaming
    // pipe:1: redirect output to stdout
    const ffmpeg = spawn("ffmpeg", [
      "-i", videoUrl,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "28",
      "-c:a", "aac",
      "-b:a", "128k",
      "-f", "mp4",
      "-movflags", "frag_keyframe+empty_moov",
      "pipe:1"
    ]);

    // Pipe ffmpeg output directly to client response
    ffmpeg.stdout.pipe(res);

    // Monitor for client connection drop to prevent ffmpeg orphan processes
    req.on("close", () => {
      console.log("Client disconnected, terminating transcoding process");
      ffmpeg.kill("SIGKILL");
    });

    ffmpeg.on("error", (err) => {
      console.error("FFmpeg execution error:", err);
      if (!res.headersSent) {
        res.status(500).send("Transcoding error");
      }
    });

    ffmpeg.stderr.on("data", (data) => {
      // ffmpeg writes status reports to stderr periodically
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
