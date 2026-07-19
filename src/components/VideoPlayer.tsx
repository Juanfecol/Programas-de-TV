import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = savedTime;
    }
  }, [episode.url, savedTime]);

  return (
    <div className="bg-black relative aspect-video rounded-xl overflow-hidden shadow-2xl">
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
    </div>
  );
};
