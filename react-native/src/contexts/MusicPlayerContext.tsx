import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { State, useProgress } from 'react-native-track-player';
import meditationBuddha from '../../assets/meditation_buddha.mp3';

const TRACK = {
  id: 'meditation_buddha',
  url: meditationBuddha,
  title: 'Om Mane Padme Hum',
  artist: 'Guras',
};

interface MusicPlayerContextType {
  isSetup: boolean;
  isPlaying: boolean;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  progress: ReturnType<typeof useProgress>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  return ctx;
};

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSetup, setIsSetup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const progress = useProgress();

  useEffect(() => {
    let isMounted = true;
    async function setup() {
      try {
        await TrackPlayer.setupPlayer();
      } catch (error: unknown) {
        let message = '';
        if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
          message = (error as { message: string }).message;
        }
        if (!message.includes('already been initialized')) throw error;
      }
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        await TrackPlayer.reset();
        await TrackPlayer.add([TRACK]);
      }
      if (isMounted) setIsSetup(true);
    }
    setup();
    return () => { isMounted = false; };
  }, []);

  const play = useCallback(async () => {
    await TrackPlayer.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(async () => {
    await TrackPlayer.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await pause();
    } else {
      await play();
    }
  }, [play, pause]);

  // Optionally, listen to TrackPlayer events to update isPlaying

  return (
    <MusicPlayerContext.Provider value={{ isSetup, isPlaying, play, pause, togglePlayback, progress }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}; 