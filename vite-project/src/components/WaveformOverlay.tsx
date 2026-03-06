import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformOverlayProps {
  audioUrl: string;
  isPlaying: boolean;
  setCurrentTime: (time: number) => void;
}

// Extend the Navigator interface for the non-standard audioSession property
interface NavigatorWithAudioSession extends Navigator {
  audioSession?: {
    type: 'playback' | 'play-and-record' | 'record' | 'ambient';
  };
}

const WaveformOverlay: React.FC<WaveformOverlayProps> = ({ audioUrl, isPlaying, setCurrentTime }) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lineVisible, setLineVisible] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const t = setTimeout(() => setLineVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [isLoaded]);

  useEffect(() => {
    const customNavigator = navigator as NavigatorWithAudioSession;
    if (customNavigator.audioSession) {
      customNavigator.audioSession.type = 'playback';
    }

    setIsLoaded(false);
    setLineVisible(true);

    if (!waveformRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(255, 255, 255)',
      progressColor: 'rgb(160, 71, 71)',
      cursorColor: 'rgb(0, 0, 0)',
      barWidth: 0,
      hideScrollbar: true,
      height: 75,
      backend: 'MediaElement',
      fetchParams: {
        cache: 'default',
        mode: 'cors',
        method: 'GET',
      },
    });

    wavesurferRef.current.load(audioUrl);

    wavesurferRef.current.on('ready', () => {
      setIsLoaded(true);
      if (isPlaying) {
        wavesurferRef.current?.play();
      }
    });

    wavesurferRef.current.on('audioprocess', (time) => {
      setCurrentTime(time);
    });

    return () => {
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.play();
      } else {
        wavesurferRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="relative w-full" style={{ height: 75 }}>
      {lineVisible && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          style={{
            transition: 'opacity 0.6s ease',
            opacity: isLoaded ? 0 : 1,
          }}
        >
          <div
            style={{
              width: '100%',
              height: 2,
              background: 'white',
              filter: 'blur(4px)',
              transformOrigin: 'center',
              transition: 'transform 0.6s ease',
              transform: isLoaded ? 'scaleY(0)' : 'scaleY(1)',
              animation: isLoaded ? 'none' : 'lineExpand 1.2s ease-in-out infinite',
            }}
          />
        </div>
      )}
      <div
        className="w-full z-10"
        ref={waveformRef}
        style={{
          filter: isLoaded ? 'drop-shadow(0 0 15px rgba(160, 71, 71, 0.3))' : 'none',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />
    </div>
  );
};

export default WaveformOverlay;