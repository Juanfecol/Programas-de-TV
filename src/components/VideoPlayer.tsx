import React, { useRef, useEffect, useState } from 'react';
import { Episode } from '../types';
import { Loader2, Maximize, Minimize, PictureInPicture, Play, Pause, RotateCcw, RotateCw, Settings } from 'lucide-react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  episode: Episode;
  onTimeUpdate: (time: number, duration: number) => void;
  onEnded: () => void;
  savedTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episode,
  onTimeUpdate,
  onEnded,
  savedTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showUi, setShowUi] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setErrorMessage(null);

    const isHlsUrl = episode.url.includes('.m3u8') || episode.url.includes('m3u8');

    if (isHlsUrl && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        maxBufferLength: 180,
        maxMaxBufferLength: 600,
        maxBufferSize: 150 * 1000 * 1000,
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;
      hls.loadSource(episode.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (savedTime > 0) {
          video.currentTime = savedTime;
        }
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMessage('Reconectando con Bunny.net CDN...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMessage('Optimizando buffer de video...');
              hls.recoverMediaError();
              break;
            default:
              setErrorMessage('Error al reproducir. Reiniciando stream...');
              hls.destroy();
              break;
          }
        }
      });
    } else {
      // Bunny.net direct CDN stream (MP4/AVI) with Range request optimization
      video.src = episode.url;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';
      if (savedTime > 0) {
        video.currentTime = savedTime;
      }
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.removeAttribute('src');
        video.load();
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [episode.url, savedTime]);

  const handleMouseMove = () => {
    setShowUi(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowUi(false);
        setShowSettings(false);
      }
    }, 3000);
  };

  const handleStalled = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setIsLoading(true);
      videoRef.current.currentTime = cur;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleError = () => {
    setErrorMessage('Error cargando desde Bunny.net. Reintentando...');
    setTimeout(() => {
      if (videoRef.current) {
        const cur = videoRef.current.currentTime;
        videoRef.current.load();
        videoRef.current.currentTime = cur;
        videoRef.current.play().catch(() => {});
      }
    }, 2000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-black relative aspect-video rounded-2xl overflow-hidden shadow-2xl group ${!showUi ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowUi(false);
          setShowSettings(false);
        }
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 pointer-events-none backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            <span className="text-xs text-neutral-200 font-medium tracking-wide">Cargando optimizado desde Bunny.net...</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-xs px-4 py-2 rounded-lg z-30 shadow-lg font-medium">
          {errorMessage}
        </div>
      )}

      <video
        ref={videoRef}
        key={episode.url}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
        onWaiting={() => setIsLoading(true)}
        onStalled={handleStalled}
        onPlaying={() => {
          setIsLoading(false);
          setErrorMessage(null);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onCanPlay={() => setIsLoading(false)}
        onError={handleError}
        onEnded={onEnded}
      >
        <source src={episode.url} />
        Tu navegador no soporta la reproducción de video.
      </video>

      {/* Overlay UI Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none transition-opacity duration-300 flex flex-col justify-between p-4 md:p-6 ${showUi ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-neutral-200">
            Episodio {episode.episodio}: {episode.titulo}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePiP}
              className="p-2 bg-black/50 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Picture-in-Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-black/50 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-1 text-xs font-medium"
                title="Configuración"
              >
                <Settings className="w-4 h-4" />
                <span>{playbackRate}x</span>
              </button>

              {showSettings && (
                <div className="absolute right-0 bottom-full mb-2 bg-neutral-900 border border-neutral-700 rounded-xl p-2 shadow-2xl z-40 min-w-[120px] pointer-events-auto">
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 px-2 py-1 font-bold">Velocidad</div>
                  {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${playbackRate === rate ? 'bg-red-600 text-white' : 'hover:bg-neutral-800 text-neutral-200'}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={toggleFullscreen}
              className="p-2 bg-black/50 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Pantalla completa"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Play/Pause & Skip */}
        <div className="flex items-center justify-center gap-6 pointer-events-auto">
          <button 
            onClick={() => skipTime(-10)}
            className="p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"
            title="Retroceder 10s"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={togglePlay}
            className="p-4 bg-red-600 hover:bg-red-500 rounded-full text-white shadow-lg transition-all hover:scale-110"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          <button 
            onClick={() => skipTime(10)}
            className="p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"
            title="Adelantar 10s"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Bar Info */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pointer-events-auto">
          <span>Servidor Bunny.net CDN (Ultra Streaming)</span>
          <span>Usa las flechas y controles para navegar</span>
        </div>
      </div>
    </div>
  );
};
