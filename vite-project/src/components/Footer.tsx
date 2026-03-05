import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import WaveformOverlay from './WaveformOverlay';
import ScrollingText from './ScrollingText';

export const Footer: React.FC = () => {
  const { currentBeatUrl, currentBeatImage, currentBeatName, currentBeatId, isPlaying, setIsPlaying, setCurrentTime } = useMusicPlayer();

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <footer className="bg-darkest border-t border-light/20 text-text fixed bottom-0 w-full z-10">
      <div className="flex items-center h-24 sm:h-28 px-2 sm:px-4 gap-3">
        <div className="relative shrink-0 aspect-square bg-darkes rounded-lg overflow-hidden group flex justify-center items-center w-16 h-16 sm:w-20 sm:h-20">
          {currentBeatImage && (
            <img
              src={currentBeatImage}
              alt="Currently playing"
              className="w-full h-full object-cover"
            />
          )}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            onClick={handlePlayPause}
          >
            <div className="w-10 h-10 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                {isPlaying ? <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /> : <path d="M8 5v14l11-7L8 5z" />}
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col min-w-0 shrink-0 w-24 sm:w-32">
          <span className="text-[10px] uppercase tracking-wider text-lightest mb-0.5">Odtwarzanie</span>
          <ScrollingText width={90} text={currentBeatName || 'Nie wybrano bitu'} beatId={currentBeatId} />
        </div>

        <div className="flex-1 min-w-0">
          {currentBeatUrl && <WaveformOverlay audioUrl={currentBeatUrl} isPlaying={isPlaying} setCurrentTime={setCurrentTime} />}
        </div>
      </div>
    </footer>
  );
};
