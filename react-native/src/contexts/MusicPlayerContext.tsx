import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { State, useProgress, Capability, Event, Track } from 'react-native-track-player';
import { useDispatch } from 'react-redux';
import { setIsPlaying } from '@/store/musicPlayerSlice';

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string;
  duration?: number;
}

interface MusicPlayerContextType {
  isSetup: boolean;
  isPlaying: boolean;
  currentTrack: TrackInfo | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  playTrack: (track: TrackInfo) => Promise<void>;
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
  const [isPlaying, setIsPlayingState] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo | null>(null);
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
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          // Enable background playback
          android: {
            appKilledPlaybackBehavior: 'StopPlaybackAndRemoveNotification',
          },
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

  const playTrack = useCallback(async (track: TrackInfo) => {
    try {
      console.log('🎵 Playing track:', track.title);
      console.log('🎵 Track URL:', track.url);
      console.log('🎵 Track artwork:', track.artwork);

      // Test if the URL is accessible
      try {
        console.log('🎵 Testing URL accessibility...');
        const response = await fetch(track.url, { method: 'HEAD' });
        console.log('🎵 URL test response status:', response.status);
        console.log('🎵 URL test response headers:', response.headers);
      } catch (urlError) {
        console.error('🎵 URL accessibility test failed:', urlError);
      }

      // Convert TrackInfo to Track format for TrackPlayer
      const trackPlayerTrack: Track = {
        id: track.id,
        url: track.url, // Use the actual S3 URL
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        duration: track.duration,
      };

      console.log('🎵 TrackPlayer track object:', trackPlayerTrack);

      // Clear current queue and add new track
      await TrackPlayer.reset();
      await TrackPlayer.add(trackPlayerTrack);

      // Update current track state
      setCurrentTrack(track);

      // Start playing
      await TrackPlayer.play();
      setIsPlayingState(true);
    } catch (error) {
      console.error('🎵 Error playing track:', error);
    }
  }, []);

  // Update isPlaying state based on TrackPlayer state
  useEffect(() => {
    const updatePlayingState = async () => {
      const state = await TrackPlayer.getState();
      const playing = state === State.Playing;
      console.log('🎵 TrackPlayer state changed:', state, 'isPlaying:', playing);
      setIsPlayingState(playing);
      dispatch(setIsPlaying(playing));
    };

    // Initial state check
    updatePlayingState();

    // Set up event listeners for state changes
    const stateListener = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      console.log('🎵 PlaybackState event:', data.state);
      const playing = data.state === State.Playing;
      setIsPlayingState(playing);
      dispatch(setIsPlaying(playing));
    });

    return () => {
      stateListener.remove();
    };
  }, [dispatch]);

  return (
    <MusicPlayerContext.Provider value={{
      isSetup,
      isPlaying,
      currentTrack,
      play,
      pause,
      togglePlayback,
      playTrack,
      progress
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}; 