import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { State, useProgress, Capability, Event } from 'react-native-track-player';
import { useDispatch } from 'react-redux';
import { setIsPlaying } from '@/store/musicPlayerSlice';

interface MusicPlayerContextType {
  isSetup: boolean;
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
  const dispatch = useDispatch();
  const progress = useProgress();

  // Debug progress updates
  useEffect(() => {
    console.log('🎵 MusicPlayerContext Progress Update:', {
      position: progress.position,
      duration: progress.duration,
      buffered: progress.buffered
    });
  }, [progress.position, progress.duration, progress.buffered]);

  useEffect(() => {
    let isMounted = true;
    async function setup() {
      try {
        console.log('🎵 Setting up TrackPlayer...');
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
        console.log('✅ TrackPlayer setup completed');
      } catch (error: unknown) {
        let message = '';
        if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
          message = (error as { message: string }).message;
        }
        if (!message.includes('already been initialized')) throw error;
      }
      // Initialize with empty queue - tracks will be added dynamically from API
      await TrackPlayer.reset();
      if (isMounted) {
        setIsSetup(true);
        console.log('✅ TrackPlayer is ready');
      }
    }
    setup();

    // Listen for playback state changes
    const onPlaybackState = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      console.log('🎵 Playback state changed:', data.state);
      if (data.state === State.Playing) {
        dispatch(setIsPlaying(true));
      } else {
        dispatch(setIsPlaying(false));
      }
    });
    return () => {
      isMounted = false;
      onPlaybackState.remove();
    };
  }, []);

  const play = useCallback(async () => {
    console.log('🎵 Play called');
    await TrackPlayer.play();
  }, []);

  const pause = useCallback(async () => {
    console.log('🎵 Pause called');
    await TrackPlayer.pause();
  }, []);

  const togglePlayback = useCallback(async () => {
    const state = await TrackPlayer.getState();
    console.log('🎵 Toggle playback, current state:', state);
    if (state === State.Playing) {
      await pause();
    } else {
      await play();
    }
  }, [play, pause]);

  return (
    <MusicPlayerContext.Provider value={{ isSetup, play, pause, togglePlayback, progress }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}; 