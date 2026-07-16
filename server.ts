import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Background transcoding registry to prevent duplicate spawns
const activeTranscodes = new Map<string, {
  process: any;
  promise: Promise<void>;
  startedAt: number;
}>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure cache directory exists
  const CACHE_DIR = "/tmp/video-cache";
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  // Transcoding API endpoint with seeking and cache support
  app.get("/api/video", async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).send("Missing url parameter");
    }

    // Generate stable hash for the cache filename based on URL
    const hash = crypto.createHash("md5").update(videoUrl).digest("hex");
    const cachePath = path.join(CACHE_DIR, `${hash}.mp4`);

    console.log(`Request received for video URL: ${videoUrl}`);

    // Case 1: Video is fully cached. Serve it instantly with range support!
    if (fs.existsSync(cachePath) && !activeTranscodes.has(videoUrl)) {
      console.log(`Cache HIT for ${videoUrl}. Serving static file.`);
      return res.sendFile(cachePath);
    }

    // Case 3: Transcoding is already active.
    // Stream a direct, lightweight transcode to this client's response.
    if (activeTranscodes.has(videoUrl)) {
      console.log(`Cache IN-PROGRESS for ${videoUrl}. Streaming direct parallel live transcode...`);
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Cache-Control", "no-cache");

      const ffmpegLive = spawn("ffmpeg", [
        "-user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "-analyzeduration", "100000",
        "-probesize", "100000",
        "-timeout", "5000000",
        "-i", videoUrl,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "28",
        "-c:a", "aac",
        "-b:a", "128k",
        "-f", "mp4",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "pipe:1"
      ]);

      ffmpegLive.stdout.pipe(res);

      req.on("close", () => {
        console.log(`Live stream client disconnected. Terminating parallel live FFmpeg process.`);
        ffmpegLive.kill("SIGKILL");
      });

      ffmpegLive.on("error", (err) => {
        console.error(`Live FFmpeg error:`, err);
      });

      return;
    }

    // Case 2: Cache MISS. Start a background transcode that writes to a .tmp file
    // and streams the live chunks to this first requester simultaneously.
    console.log(`Cache MISS for ${videoUrl}. Starting dual-stream background transcode...`);
    
    const tempCachePath = `${cachePath}.tmp`;
    
    // Set headers for live streaming
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Cache-Control", "no-cache");

    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    const ffmpeg = spawn("ffmpeg", [
      "-user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "-analyzeduration", "100000",
      "-probesize", "100000",
      "-timeout", "5000000",
      "-i", videoUrl,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "28",
      "-c:a", "aac",
      "-b:a", "128k",
      "-f", "mp4",
      "-movflags", "frag_keyframe+empty_moov+default_base_moof",
      "pipe:1"
    ]);

    activeTranscodes.set(videoUrl, {
      process: ffmpeg,
      promise,
      startedAt: Date.now()
    });

    // Create write stream to the temp cache file
    const writeStream = fs.createWriteStream(tempCachePath);

    ffmpeg.stdout.on("data", (chunk) => {
      writeStream.write(chunk);
      if (!res.destroyed) {
        res.write(chunk);
      }
    });

    ffmpeg.stdout.on("end", () => {
      writeStream.end();
      if (!res.destroyed) {
        res.end();
      }
    });

    ffmpeg.on("close", (code) => {
      console.log(`FFmpeg transcoding finished for ${videoUrl} with code ${code}`);
      activeTranscodes.delete(videoUrl);
      
      if (code === 0) {
        // Success! Rename the temp file to the final cache path
        fs.rename(tempCachePath, cachePath, (err) => {
          if (err) {
            console.error(`Error renaming temp cache file to ${cachePath}:`, err);
          } else {
            console.log(`Successfully cached transcoded video at ${cachePath}`);
          }
        });
      } else {
        // Failed. Clean up the temp file
        console.log(`Transcoding failed with code ${code}. Deleting temp file.`);
        fs.unlink(tempCachePath, () => {});
      }
      resolvePromise();
    });

    ffmpeg.on("error", (err) => {
      console.error(`FFmpeg error for ${videoUrl}:`, err);
      activeTranscodes.delete(videoUrl);
      writeStream.end();
      fs.unlink(tempCachePath, () => {});
      resolvePromise();
    });

    req.on("close", () => {
      console.log(`Initial client disconnected for ${videoUrl}. Caching continues in background.`);
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
