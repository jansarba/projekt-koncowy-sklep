import React from 'react';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import WaveformOverlay from './WaveformOverlay';
import ScrollingText from './ScrollingText';

export const Footer: React.FC = () => {
  const {
    currentBeatUrl,
    currentBeatImage,
    currentBeatName,
    currentBeatId,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
  } = useMusicPlayer();

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev); // Toggle play/pause state
  };

  return (
    <div className="bg-darkes text-slate-100 fixed bottom-0 w-full p-2 flex h-32 z-10 justify-center items-center">
      <div className="relative mr-4 aspect-square bg-darkest p-2 group flex justify-center items-center sm:w-auto sm:h-auto w-16 h-16">
        {currentBeatImage && (
          <img
            src={currentBeatImage}
            alt="Currently playing"
            className="rounded-md max-w-32 max-h-32 h-full object-scale-down flex items-center justify-center sm:w-32 sm:h-32 w-14"
          />
        )}
        {/* Play/Pause Icon */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={handlePlayPause}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {isPlaying ? (
              // Pause icon
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            ) : (
              // Play icon
              <path d="M8 5v14l11-7L8 5z" />
            )}
          </svg>
        </div>
        {/* <div className="flex flex-col items-start gap-2 absolute">
            Playing:
        <ScrollingText width={100} text={currentBeatName || 'No beat selected'} beatId={currentBeatId}/>
        </div> */}
      </div>

      {/* Waveform Section */}
      <div className="flex w-full items-center justify-between gap-1 sm:gap-4 -z-10">
        <div className="flex flex-col items-start gap-2 absolute">
            Playing:
        <ScrollingText width={90} text={currentBeatName || 'No beat selected'} beatId={currentBeatId}/>
        </div>
        <div className='min-w-24 z-10 sm:min-w-28'>

        </div>
        {currentBeatUrl && (
          <WaveformOverlay
            audioUrl={currentBeatUrl}
            isPlaying={isPlaying}
            setCurrentTime={setCurrentTime}
          />
        )}
      </div>
    </div>
  );
};