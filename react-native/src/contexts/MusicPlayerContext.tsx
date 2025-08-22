import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { State, useProgress, Capability, Event, Track, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { AudioFile } from '@/services/api';
// No Redux - MusicPlayerContext is the single source of truth

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
  audioFiles: AudioFile[];
  currentTrackIndex: number;
  loading: boolean;
  isFullPlayerVisible: boolean;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stopAndClear: () => Promise<void>;
  stopAndClearWithFadeOut: (fadeDurationMs?: number) => Promise<void>;
  fadeOutOnly: (fadeDurationMs?: number) => Promise<void>;
  togglePlayback: () => Promise<void>;
  playTrack: (track: TrackInfo) => Promise<void>;
  playMeditationTrack: (track: MeditationTrack) => Promise<void>;
  setSelectedMeditationTrack: (track: MeditationTrack | null) => void;
  clearMeditationTracks: () => void;
  setAudioFiles: (files: AudioFile[]) => void;
  setCurrentTrackIndex: (index: number) => void;
  setCurrentTrack: (track: TrackInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setFullPlayerVisible: (visible: boolean) => void;
  nextTrack: () => void;
  previousTrack: () => void;
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
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFullPlayerVisible, setFullPlayerVisible] = useState(false);
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
    let setupAttempted = false;

    async function setup() {
      if (setupAttempted) return;
      setupAttempted = true;

      try {
        console.log('🎵 MusicPlayerContext: Starting TrackPlayer setup...');

        // Wait a bit to ensure the app is fully loaded
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if TrackPlayer is already initialized
        try {
          const state = await TrackPlayer.getPlaybackState();
          console.log('🎵 TrackPlayer current state:', state);

          // If we can get state, TrackPlayer is already initialized
          if (state && state.state !== undefined) {
            console.log('🎵 TrackPlayer already initialized, skipping setup');
            if (isMounted) {
              setIsSetup(true);
              console.log('✅ TrackPlayer is ready (already initialized)');
            }
            return;
          }
        } catch (stateError) {
          console.log('🎵 TrackPlayer not initialized yet, proceeding with setup...');
        }

        // Setup TrackPlayer with timeout to prevent hanging
        console.log('🎵 Calling TrackPlayer.setupPlayer()...');
        const setupPromise = TrackPlayer.setupPlayer();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TrackPlayer setup timeout')), 10000)
        );

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

        // Initialize with empty queue
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

        // Handle "already initialized" errors gracefully
        if (message.includes('already been initialized') || message.includes('already initialized')) {
          console.log('🎵 TrackPlayer already initialized, continuing...');
          if (isMounted) {
            setIsSetup(true);
            console.log('✅ TrackPlayer is ready (already initialized)');
          }
        } else {
          console.error('🎵 TrackPlayer setup failed with error:', message);
          // Don't set setup to true if it really failed
          console.log('❌ TrackPlayer setup failed, music features will be disabled');
        }
      }
    }

    // Delay setup to ensure app is fully loaded
    const timer = setTimeout(setup, 500);

    // Listen for playback state changes
    const onPlaybackState = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      console.log('🎵 Playback state changed:', data.state);
      const playing = data.state === State.Playing;
      setIsPlayingState(playing);
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
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

  const fadeOutOnly = useCallback(async (fadeDurationMs: number = 2000) => {
    try {
      // Check if music is actually playing before attempting fade-out
      const playbackState = await TrackPlayer.getPlaybackState();
      const isCurrentlyPlaying = playbackState.state === State.Playing;

      console.log(`🎵 fadeOutOnly called - isPlaying: ${isCurrentlyPlaying}, duration: ${fadeDurationMs}ms`);

      if (!isCurrentlyPlaying) {
        console.log('🎵 Music not playing, skipping fade-out');
        return;
      }

      console.log(`🎵 Starting fade-out only over ${fadeDurationMs}ms...`);

      // Get current volume (default to 1.0 if not available)
      let currentVolume = 1.0;
      try {
        currentVolume = await TrackPlayer.getVolume();
        console.log(`🎵 Current volume: ${currentVolume}`);
      } catch (volumeError) {
        console.log('🎵 Could not get current volume, using default 1.0');
      }

      // Use more steps for smoother fade-out
      const steps = 50; // More steps for smoother fade
      const stepDuration = fadeDurationMs / steps;
      const volumeStep = currentVolume / steps;

      console.log(`🎵 Fade-out config: ${steps} steps, ${stepDuration}ms per step, ${volumeStep.toFixed(3)} volume per step`);

      for (let i = 1; i <= steps; i++) {
        const newVolume = Math.max(0, currentVolume - (volumeStep * i));

        try {
          await TrackPlayer.setVolume(newVolume);

          // Log every 10th step to avoid spam
          if (i % 10 === 0 || i === steps) {
            console.log(`🎵 Fade step ${i}/${steps}: volume = ${newVolume.toFixed(3)}`);
          }
        } catch (volumeError) {
          console.log(`🎵 Volume control not available at step ${i}, error:`, volumeError);
          // If volume control fails, we can't fade out properly
          break;
        }

        // Wait for next step (except on last iteration)
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
      }

      console.log('🎵 Fade-out complete (volume should be at 0)');

      // Verify final volume
      try {
        const finalVolume = await TrackPlayer.getVolume();
        console.log(`🎵 Final volume after fade-out: ${finalVolume}`);
      } catch (error) {
        console.log('🎵 Could not verify final volume');
      }

    } catch (error) {
      console.error('❌ fadeOutOnly failed:', error);
      throw error;
    }
  }, []);

  const stopAndClearWithFadeOut = useCallback(async (fadeDurationMs: number = 2000) => {
    try {
      // First fade out the volume
      await fadeOutOnly(fadeDurationMs);

      console.log('🎵 Stopping and clearing after fade-out...');

      // Now stop and clear the player
      await TrackPlayer.pause();
      await TrackPlayer.reset();

      // Reset volume back to original level for next track
      try {
        await TrackPlayer.setVolume(1.0);
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
  }, [fadeOutOnly]);

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
        const maxAttempts = 30; // 3 seconds max wait

        while (!isSetup && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!isSetup) {
          console.error('🎵 TrackPlayer setup timeout, attempting to play anyway...');
          // Don't throw error, try to play anyway
        } else {
          console.log('✅ TrackPlayer is now ready after waiting');
        }
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
    // Also clear the current track to prevent audio tab from showing it as selected
    setCurrentTrack(null);
  }, []);

  const nextTrack = useCallback(() => {
    if (audioFiles.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
      setCurrentTrackIndex(nextIndex);
    }
  }, [audioFiles.length, currentTrackIndex]);

  const previousTrack = useCallback(() => {
    if (audioFiles.length > 0) {
      const prevIndex = currentTrackIndex === 0 ? audioFiles.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
    }
  }, [audioFiles.length, currentTrackIndex]);

  const playTrack = useCallback(async (track: TrackInfo) => {
    try {
      console.log('🎵 Playing track:', track.title);
      console.log('🎵 Track URL:', track.url);
      console.log('🎵 Track artwork:', track.artwork);

      // Wait for TrackPlayer to be set up if it's not ready yet
      if (!isSetup) {
        console.log('🎵 TrackPlayer not ready yet, waiting for setup...');
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max wait

        while (!isSetup && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!isSetup) {
          console.error('🎵 TrackPlayer setup timeout, cannot play track');
          throw new Error('TrackPlayer is not ready. Please try again in a moment.');
        } else {
          console.log('✅ TrackPlayer is now ready after waiting');
        }
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
      audioFiles,
      currentTrackIndex,
      loading,
      isFullPlayerVisible,
      play,
      pause,
      stopAndClear,
      stopAndClearWithFadeOut,
      fadeOutOnly,
      togglePlayback,
      playTrack,
      playMeditationTrack,
      setSelectedMeditationTrack,
      clearMeditationTracks,
      setAudioFiles,
      setCurrentTrackIndex,
      setCurrentTrack,
      setLoading,
      setFullPlayerVisible,
      nextTrack,
      previousTrack,
      progress
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};