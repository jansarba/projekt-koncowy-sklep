import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MusicPlayerContextType {
  currentBeatUrl: string | null;
  currentBeatImage: string | null;
  currentBeatName: string | null;
  currentBeatId: number | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  setCurrentTime: (time: number) => void;
  setDuration: (time: number) => void;
  setCurrentBeatUrl: (url: string | null) => void;
  setCurrentBeatImage: (image: string | null) => void;
  setCurrentBeatName: (name: string | null) => void;
  setCurrentBeatId: (id: number | null) => void;
  setIsPlaying: (isPlaying: boolean | ((prev: boolean) => boolean)) => void; // Allow a function for toggling
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({ children }) => {
  const [currentBeatUrl, setCurrentBeatUrl] = useState<string | null>(null);
  const [currentBeatImage, setCurrentBeatImage] = useState<string | null>(null);
  const [currentBeatName, setCurrentBeatName] = useState<string | null>(null);
  const [currentBeatId, setCurrentBeatId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentBeatUrl,
        currentBeatImage,
        currentBeatName,
        currentBeatId,
        currentTime,
        duration,
        isPlaying,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        setCurrentBeatUrl,
        setCurrentBeatImage,
        setCurrentBeatName,
        setCurrentBeatId,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};