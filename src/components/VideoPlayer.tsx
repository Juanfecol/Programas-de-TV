import React, { useRef, useEffect, useState } from 'react';
import { Episode } from '../types';
import { Loader2 } from 'lucide-react';

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
  const [showUi, setShowUi] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (savedTime > 0) {
        video.currentTime = savedTime;
      }
    }
    return () => {
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
      }
    }, 3000);
  };

  const handleStalledOrWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
    setErrorMessage(null);
  };

  const handleStalled = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      videoRef.current.load();
      videoRef.current.currentTime = cur;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleError = () => {
    setErrorMessage('El video se interrumpió. Reconectando...');
    setTimeout(() => {
      if (videoRef.current) {
        const cur = videoRef.current.currentTime;
        videoRef.current.load();
        videoRef.current.currentTime = cur;
        videoRef.current.play().catch(() => {});
      }
    }, 2000);
  };

  return (
    <div 
      className={`bg-black relative aspect-video rounded-xl overflow-hidden shadow-2xl ${!showUi ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowUi(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            <span className="text-xs text-neutral-300 font-medium">Cargando episodio...</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-xs px-4 py-2 rounded-lg z-20 shadow-lg">
          {errorMessage}
        </div>
      )}

      <video
        ref={videoRef}
        key={episode.url}
        controls
        preload="auto"
        playsInline
        className={`w-full h-full transition-opacity duration-300 ${!showUi ? 'opacity-95' : 'opacity-100'}`}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
        onWaiting={handleStalledOrWaiting}
        onStalled={handleStalled}
        onPlaying={handlePlaying}
        onCanPlay={() => setIsLoading(false)}
        onError={handleError}
        onEnded={onEnded}
      >
        <source src={episode.url} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

