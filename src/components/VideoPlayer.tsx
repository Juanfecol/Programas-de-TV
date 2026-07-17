import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Copy } from 'lucide-react';
import { Episode } from '../types';

interface VideoPlayerProps {
  episode: Episode;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onEnded: () => void;
}

export const getVideoSrc = (url: string) => {
  if (!url) return '';
  // Sanitize URL
  let sanitized = url;
  try {
    sanitized = decodeURIComponent(url);
  } catch (e) {
    // Ignore decode errors
  }
  
  if (sanitized.toLowerCase().endsWith('.avi')) {
    return `/api/video?url=${encodeURIComponent(sanitized)}`;
  }
  return sanitized;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episode,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handle source change
    const newSrc = getVideoSrc(episode.url);
    if (video.src !== newSrc) {
      video.src = newSrc;
      video.load();
    }

    // Play only after loading metadata
    const handleCanPlay = () => {
      video.play().catch((e) => console.log("Play interrupted:", e));
    };

    video.addEventListener('canplay', handleCanPlay, { once: true });

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [episode.url]);

  return (
    <div className="bg-black relative aspect-video group rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        controls
        autoPlay
        className="w-full h-full"
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => onLoadedMetadata(e.currentTarget.duration)}
        onEnded={onEnded}
        onError={(e) => {
          const video = e.currentTarget;
          console.error("Video error, retrying...", video.error?.message);
          setTimeout(() => {
            video.load();
            video.play().catch(console.error);
          }, 2000);
        }}
      />

      {/* Navigation Overlays */}
      {hasPrev && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <button
            onClick={onPrev}
            className="flex items-center space-x-1 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full transition pointer-events-auto"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-semibold">Anterior</span>
          </button>
        </div>
      )}

      {hasNext && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <button
            onClick={onNext}
            className="flex items-center space-x-1 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full transition pointer-events-auto"
          >
            <span className="text-xs font-semibold">Siguiente</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
