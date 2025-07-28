import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { State, useProgress, Capability, Event } from 'react-native-track-player';

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
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
        });
      } catch (error: unknown) {
        let message = '';
        if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
          message = (error as { message: string }).message;
        }
        if (!message.includes('already been initialized')) throw error;
      }
      // Initialize with empty queue - tracks will be added dynamically from API
      await TrackPlayer.reset();
      if (isMounted) setIsSetup(true);
    }
    setup();

    // Listen for playback state changes
    const onPlaybackState = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      if (data.state === State.Playing) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    });
    return () => {
      isMounted = false;
      onPlaybackState.remove();
    };
  }, []);

  const play = useCallback(async () => {
    await TrackPlayer.play();
  }, []);

  const pause = useCallback(async () => {
    await TrackPlayer.pause();
  }, []);

  const togglePlayback = useCallback(async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await pause();
    } else {
      await play();
    }
  }, [play, pause]);

  return (
    <MusicPlayerContext.Provider value={{ isSetup, isPlaying, play, pause, togglePlayback, progress }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}; 