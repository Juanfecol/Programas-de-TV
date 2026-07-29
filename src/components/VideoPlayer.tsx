import React, { useRef, useEffect, useState } from 'react';
import { Episode } from '../types';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = savedTime;
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

  return (
    <div 
      className={`bg-black relative aspect-video rounded-xl overflow-hidden shadow-2xl ${!showUi ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowUi(false)}
    >
      <video
        ref={videoRef}
        key={episode.url}
        controls
        className={`w-full h-full transition-opacity duration-300 ${!showUi ? 'opacity-95' : 'opacity-100'}`}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
        onEnded={onEnded}
      >
        <source src={episode.url} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

