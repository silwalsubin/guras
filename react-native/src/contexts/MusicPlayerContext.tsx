import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { State, useProgress, Capability, Event, Track, AppKilledPlaybackBehavior } from 'react-native-track-player';
// No Redux - MusicPlayerContext manages everything
// No Redux imports - MusicPlayerContext is the single source of truth

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string;
  duration?: number;
}

export interface MeditationTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string;
  duration?: number;
  category: 'ambient' | 'nature' | 'meditation' | 'binaural';
  isLoop: boolean;
}

interface MusicPlayerContextType {
  isSetup: boolean;
  isPlaying: boolean;
  currentTrack: TrackInfo | null;
  selectedMeditationTrack: MeditationTrack | null;
  activeMeditationTrack: MeditationTrack | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stopAndClear: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  playTrack: (track: TrackInfo) => Promise<void>;
  playMeditationTrack: (track: MeditationTrack) => Promise<void>;
  setSelectedMeditationTrack: (track: MeditationTrack | null) => void;
  clearMeditationTracks: () => void;
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
  const [selectedMeditationTrack, setSelectedMeditationTrack] = useState<MeditationTrack | null>(null);
  const [activeMeditationTrack, setActiveMeditationTrack] = useState<MeditationTrack | null>(null);
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
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
          // Enable background playback
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
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
      const playing = data.state === State.Playing;
      setIsPlayingState(playing);
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

  const stopAndClear = useCallback(async () => {
    try {
      await TrackPlayer.pause();
      await TrackPlayer.reset();
      setCurrentTrack(null);
      setIsPlayingState(false);
      console.log('🎵 stopAndClear completed');
    } catch (error) {
      console.error('❌ stopAndClear failed:', error);
      throw error;
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    const playbackState = await TrackPlayer.getPlaybackState();
    console.log('🎵 Toggle playback, current state:', playbackState.state);
    if (playbackState.state === State.Playing) {
      await pause();
    } else {
      await play();
    }
  }, [play, pause]);

  const playMeditationTrack = useCallback(async (track: MeditationTrack) => {
    try {
      console.log('🎵 Playing meditation track:', track.title);

      // Wait for TrackPlayer to be set up if it's not ready yet
      if (!isSetup) {
        console.log('🎵 TrackPlayer not ready yet, waiting for setup...');
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait

        while (!isSetup && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!isSetup) {
          console.error('🎵 TrackPlayer setup timeout after 5 seconds');
          throw new Error('TrackPlayer setup timeout');
        }

        console.log('✅ TrackPlayer is now ready after waiting');
      }

      // Convert MeditationTrack to TrackPlayer format
      const trackPlayerTrack = {
        id: track.id,
        url: track.url,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        duration: track.duration,
      };

      // Set as active meditation track
      setActiveMeditationTrack(track);
      setCurrentTrack(trackPlayerTrack);

      // Clear queue and add new track
      await TrackPlayer.reset();
      await TrackPlayer.add(trackPlayerTrack);
      await TrackPlayer.play();

      console.log('✅ Meditation track playing successfully');
    } catch (error) {
      console.error('🎵 Error playing meditation track:', error);
      throw error;
    }
  }, [isSetup]);

  const clearMeditationTracks = useCallback(() => {
    console.log('🎵 Clearing meditation tracks');
    setSelectedMeditationTrack(null);
    setActiveMeditationTrack(null);
  }, []);

  const playTrack = useCallback(async (track: TrackInfo) => {
    try {
      console.log('🎵 Playing track:', track.title);
      console.log('🎵 Track URL:', track.url);
      console.log('🎵 Track artwork:', track.artwork);

      // Wait for TrackPlayer to be set up if it's not ready yet
      if (!isSetup) {
        console.log('🎵 TrackPlayer not ready yet, waiting for setup...');
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait

        while (!isSetup && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!isSetup) {
          console.error('🎵 TrackPlayer setup timeout after 5 seconds');
          throw new Error('TrackPlayer setup timeout');
        }

        console.log('✅ TrackPlayer is now ready after waiting');
      }

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

      // Check if this is a meditation track that should loop
      const isMeditationTrack = track.id.includes('meditation') || track.id.includes('long-meditation');
      console.log('🎵 Is meditation track:', isMeditationTrack);

      console.log('🎵 TrackPlayer track object:', trackPlayerTrack);

      // Clear current queue and add new track
      console.log('🎵 Resetting TrackPlayer...');
      try {
        await TrackPlayer.reset();
        console.log('🎵 TrackPlayer reset successful');
      } catch (resetError) {
        console.error('🎵 TrackPlayer reset failed:', resetError);
        // Continue anyway, might still work
      }

      console.log('🎵 Adding track to TrackPlayer...');
      await TrackPlayer.add(trackPlayerTrack);

      // Update current track state in context only
      console.log('🎵 Updating current track state...');
      setCurrentTrack(track);

      // Start playing
      console.log('🎵 Starting playback...');
      await TrackPlayer.play();
      console.log('🎵 Playback started successfully!');
      setIsPlayingState(true);
    } catch (error) {
      console.error('🎵 Error playing track:', error);
    }
  }, []);

  // Update isPlaying state based on TrackPlayer state
  useEffect(() => {
    const updatePlayingState = async () => {
      const playbackState = await TrackPlayer.getPlaybackState();
      const playing = playbackState.state === State.Playing;
      console.log('🎵 TrackPlayer state changed:', playbackState.state, 'isPlaying:', playing);
      setIsPlayingState(playing);
    };

    // Initial state check
    updatePlayingState();

    // Set up event listeners for state changes
    const stateListener = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      console.log('🎵 PlaybackState event:', data.state);
      const playing = data.state === State.Playing;
      setIsPlayingState(playing);
    });

    return () => {
      stateListener.remove();
    };
  }, []);

  return (
    <MusicPlayerContext.Provider value={{
      isSetup,
      isPlaying,
      currentTrack,
      selectedMeditationTrack,
      activeMeditationTrack,
      play,
      pause,
      stopAndClear,
      togglePlayback,
      playTrack,
      playMeditationTrack,
      setSelectedMeditationTrack,
      clearMeditationTracks,
      progress
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};