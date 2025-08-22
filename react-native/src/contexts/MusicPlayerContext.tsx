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
  stopAndClearWithFadeOut: (fadeDurationMs?: number) => Promise<void>;
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

        // Add timeout to TrackPlayer.setupPlayer()
        const setupPromise = TrackPlayer.setupPlayer();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TrackPlayer.setupPlayer() timeout after 10 seconds')), 10000);
        });

        await Promise.race([setupPromise, timeoutPromise]);
        console.log('✅ TrackPlayer.setupPlayer() completed');

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
        console.log('✅ TrackPlayer options updated');

        // Initialize with empty queue - tracks will be added dynamically from API
        await TrackPlayer.reset();
        console.log('✅ TrackPlayer queue reset');

        if (isMounted) {
          setIsSetup(true);
          console.log('✅ TrackPlayer is ready');
        }
      } catch (error: unknown) {
        console.error('🎵 TrackPlayer setup error:', error);
        let message = '';
        if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
          message = (error as { message: string }).message;
        }

        // Only ignore "already initialized" errors, throw everything else
        if (!message.includes('already been initialized')) {
          console.error('🎵 TrackPlayer setup failed with error:', message);
          // Don't throw - let the app continue but TrackPlayer won't work
          // throw error;
        } else {
          console.log('🎵 TrackPlayer already initialized, continuing...');
          // Initialize with empty queue - tracks will be added dynamically from API
          await TrackPlayer.reset();
          if (isMounted) {
            setIsSetup(true);
            console.log('✅ TrackPlayer is ready (already initialized)');
          }
        }
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

  const stopAndClearWithFadeOut = useCallback(async (fadeDurationMs: number = 2000) => {
    try {
      // Check if music is actually playing before attempting fade-out
      const playbackState = await TrackPlayer.getPlaybackState();
      const isCurrentlyPlaying = playbackState.state === State.Playing;

      if (!isCurrentlyPlaying) {
        console.log('🎵 Music not playing, skipping fade-out and stopping immediately');
        await TrackPlayer.pause();
        await TrackPlayer.reset();
        setCurrentTrack(null);
        setIsPlayingState(false);
        console.log('🎵 stopAndClearWithFadeOut completed (no fade needed)');
        return;
      }

      console.log(`🎵 Starting fade-out over ${fadeDurationMs}ms...`);

      // Get current volume (default to 1.0 if not available)
      let currentVolume = 1.0;
      try {
        currentVolume = await TrackPlayer.getVolume();
      } catch (volumeError) {
        console.log('🎵 Could not get current volume, using default 1.0');
      }

      // Create fade-out effect by gradually reducing volume
      const steps = 20; // Number of volume steps
      const stepDuration = fadeDurationMs / steps;
      const volumeStep = currentVolume / steps;

      for (let i = 1; i <= steps; i++) {
        const newVolume = Math.max(0, currentVolume - (volumeStep * i));
        try {
          await TrackPlayer.setVolume(newVolume);
          console.log(`🎵 Fade step ${i}/${steps}: volume = ${newVolume.toFixed(2)}`);
        } catch (volumeError) {
          console.log(`🎵 Volume control not available, skipping fade step ${i}`);
        }

        // Wait for next step (except on last iteration)
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
      }

      console.log('🎵 Fade-out complete, stopping playback...');

      // Now stop and clear the player
      await TrackPlayer.pause();
      await TrackPlayer.reset();

      // Reset volume back to original level for next track
      try {
        await TrackPlayer.setVolume(currentVolume);
      } catch (volumeError) {
        console.log('🎵 Could not reset volume');
      }

      setCurrentTrack(null);
      setIsPlayingState(false);
      console.log('🎵 stopAndClearWithFadeOut completed');
    } catch (error) {
      console.error('❌ stopAndClearWithFadeOut failed:', error);
      // Fallback to immediate stop if fade-out fails
      try {
        await TrackPlayer.pause();
        await TrackPlayer.reset();
        setCurrentTrack(null);
        setIsPlayingState(false);
      } catch (fallbackError) {
        console.error('❌ Fallback stop also failed:', fallbackError);
      }
      throw error;
    }
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
      stopAndClearWithFadeOut,
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