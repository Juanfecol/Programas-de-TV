import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, RotateCw, Play, Pause, Maximize } from 'lucide-react';
import { Episode } from '../types';

interface VideoPlayerProps {
  episode: Episode;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTimeUpdate: (time: number, duration: number) => void;
  onEnded: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episode,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onTimeUpdate,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
    }
  }, [episode.url]);

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="bg-black relative aspect-video group rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        key={episode.url}
        controls
        className="w-full h-full"
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
        onEnded={onEnded}
      >
        <source src={episode.url} />
        Your browser does not support the video tag.
      </video>

      {/* Navigation Overlays - TV Friendly */}
      <div className="absolute inset-x-0 bottom-16 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button onClick={() => seek(-10)} className="bg-black/80 text-white p-4 rounded-full border border-white/20 focus:ring-4 focus:ring-amber-400">
           <RotateCcw className="w-6 h-6" />
        </button>
        <button onClick={togglePlay} className="bg-black/80 text-white p-4 rounded-full border border-white/20 focus:ring-4 focus:ring-amber-400">
           {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button onClick={() => seek(10)} className="bg-black/80 text-white p-4 rounded-full border border-white/20 focus:ring-4 focus:ring-amber-400">
           <RotateCw className="w-6 h-6" />
        </button>
        <button onClick={toggleFullscreen} className="bg-black/80 text-white p-4 rounded-full border border-white/20 focus:ring-4 focus:ring-amber-400">
           <Maximize className="w-6 h-6" />
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
