import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, RotateCw } from 'lucide-react';
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
  return url;
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

    const newSrc = getVideoSrc(episode.url);
    if (video.src !== newSrc) {
      video.src = newSrc;
      video.load();
    }
  }, [episode.url]);

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

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
          console.error("Video error:", video.error?.message);
          setTimeout(() => {
            video.load();
            video.play().catch(console.error);
          }, 2000);
        }}
      />

      {/* Navigation Overlays - TV Friendly */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button onClick={() => seek(-10)} className="bg-black/80 text-white p-4 rounded-full border border-white/20 focus:ring-4 focus:ring-amber-400">
           <RotateCcw className="w-6 h-6" />
        </button>
        <button onClick={() => seek(10)} className="bg-black/80 text-white p-4 rounded-full border border-white/20 focus:ring-4 focus:ring-amber-400">
           <RotateCw className="w-6 h-6" />
        </button>
      </div>

      {hasPrev && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-6 z-20">
          <button
            onClick={onPrev}
            className="flex items-center space-x-3 bg-black/90 text-white p-5 rounded-r-xl transition-all border-2 border-white/20 hover:border-white focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-amber-400"
          >
            <ChevronLeft className="w-8 h-8" />
            <span className="text-lg font-bold">Anterior</span>
          </button>
        </div>
      )}

      {hasNext && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-6 z-20">
          <button
            onClick={onNext}
            className="flex items-center space-x-3 bg-black/90 text-white p-5 rounded-l-xl transition-all border-2 border-white/20 hover:border-white focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-amber-400"
          >
            <span className="text-lg font-bold">Siguiente</span>
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};
