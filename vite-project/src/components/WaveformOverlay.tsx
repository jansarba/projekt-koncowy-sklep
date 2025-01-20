import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformOverlayProps {
  audioUrl: string;
  isPlaying: boolean;
  setCurrentTime: (time: number) => void;
}

const WaveformOverlay: React.FC<WaveformOverlayProps> = ({
  audioUrl,
  isPlaying,
  setCurrentTime,
}) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // Track if the waveform is loaded

  useEffect(() => {
    // Check if the browser is Safari and if iOS 17 or later is detected
    if (navigator.userAgent.includes("Safari") && /iPhone|iPad|iPod/.test(navigator.userAgent) && parseInt((navigator as any).appVersion.match(/OS (\d+)_/)[1]) >= 17) {
      // Set the audio session type to "playback" to prevent muting when the ringer is off
      if ((navigator as any)['audioSession']) {
        (navigator as any)['audioSession'].type = 'playback';
      }
    }

    if (!waveformRef.current) return;

    // Create or recreate the WaveSurfer instance
    if (!wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(255, 255, 255)',
        progressColor: 'rgb(160, 71, 71)',
        cursorColor: 'rgb(0, 0, 0)',
        barWidth: 0,
        hideScrollbar: true,
        height: 75,
        backend: 'WebAudio',
        fetchParams: {
          cache: 'default', // Default cache behavior
          mode: 'cors', // CORS mode for cross-origin requests
          method: 'GET', // Request method
        },
      });

      wavesurferRef.current.load(audioUrl);

      wavesurferRef.current.on('ready', () => {
        console.log('Waveform is ready');
        setIsLoaded(true);
        if (isPlaying) {
          wavesurferRef.current?.play();
        }
      });

      wavesurferRef.current.on('audioprocess', (time) => {
        setCurrentTime(time);
      });
    }

    return () => {
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    // Control playback state based on isPlaying
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.play();
      } else {
        wavesurferRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div
      className="w-full z-10"
      ref={waveformRef}
      style={{
        filter: isLoaded ? 'drop-shadow(0 0 15px rgba(160, 71, 71, 0.3))' : 'none', // Glow effect on the waveform
      }}
    />
  );
};

export default WaveformOverlay;