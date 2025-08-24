import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { State, useProgress, Capability, Event, Track, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { AudioFile, apiService } from '@/services/api';
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
  // Loading states for different operations
  isLoadingTrack: boolean;
  isLoadingMeditationTrack: boolean;
  isLoadingAudioFiles: boolean;
  setupError: string | null;
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
  loadAudioFiles: () => Promise<void>;
  setCurrentTrackIndex: (index: number) => void;
  setCurrentTrack: (track: TrackInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setFullPlayerVisible: (visible: boolean) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  // Queue management
  loadTrackToQueue: (track: TrackInfo) => Promise<void>;
  ensureTrackInQueue: () => Promise<boolean>;
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
  // Loading states for different operations
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [isLoadingMeditationTrack, setIsLoadingMeditationTrack] = useState(false);
  const [isLoadingAudioFiles, setIsLoadingAudioFiles] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const progress = useProgress();



  useEffect(() => {
    let isMounted = true;
    let setupAttempted = false;

    async function setup() {
      if (setupAttempted) return;
      setupAttempted = true;

      try {
        // Check if TrackPlayer is already initialized
        try {
          const state = await TrackPlayer.getPlaybackState();

          // If we can get state, TrackPlayer is already initialized
          if (state && state.state !== undefined) {
            if (isMounted) {
              setIsSetup(true);
            }
            return;
          }
        } catch (stateError) {
          // TrackPlayer not initialized yet, proceed with setup
        }

        // Setup TrackPlayer with proper timeout handling
        const setupPromise = TrackPlayer.setupPlayer();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TrackPlayer setup timeout')), 10000)
        );

        await Promise.race([setupPromise, timeoutPromise]);

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
          // Enable background playbook
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
        });

        // Initialize with empty queue
        await TrackPlayer.reset();

        if (isMounted) {
          setIsSetup(true);
        }
      } catch (error: unknown) {
        let message = '';
        if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
          message = (error as { message: string }).message;
        }

        // Handle "already initialized" errors gracefully
        if (message.includes('already been initialized') || message.includes('already initialized')) {
          if (isMounted) {
            setIsSetup(true);
          }
        } else {
          setSetupError(message);
        }
      }
    }

    // Start setup immediately - no artificial delays
    setup();

    // Listen for playback state changes
    const onPlaybackState = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      const playing = data.state === State.Playing;
      setIsPlayingState(playing);
    });

    return () => {
      isMounted = false;
      onPlaybackState.remove();
    };
  }, []);

  // Queue management methods - defined early to be used by other methods
  const loadTrackToQueue = useCallback(async (track: TrackInfo) => {
    try {
      if (!isSetup) {
        throw new Error('TrackPlayer is not ready');
      }

      // Convert TrackInfo to Track format for TrackPlayer
      const trackPlayerTrack: Track = {
        id: track.id,
        url: track.url,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        duration: track.duration,
      };

      // Clear queue and add new track
      await TrackPlayer.reset();
      await TrackPlayer.add(trackPlayerTrack);

      // Update context state
      setCurrentTrack(track);

    } catch (error) {
      throw error;
    }
  }, [isSetup]);

  const ensureTrackInQueue = useCallback(async (): Promise<boolean> => {
    try {
      if (!isSetup) {
        return false;
      }

      const queue = await TrackPlayer.getQueue();

      if (queue.length === 0) {
        // If we have a current track, load it
        if (currentTrack) {
          await loadTrackToQueue(currentTrack);
          return true;
        }

        // If we have audio files, load the current index
        if (audioFiles.length > 0 && currentTrackIndex >= 0 && currentTrackIndex < audioFiles.length) {
          const audioFile = audioFiles[currentTrackIndex];
          const track: TrackInfo = {
            id: audioFile.id,
            title: audioFile.name,
            artist: audioFile.author,
            url: audioFile.audioDownloadUrl,
            artwork: audioFile.thumbnailDownloadUrl,
            duration: audioFile.durationSeconds,
          };
          await loadTrackToQueue(track);
          return true;
        }

        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [isSetup, currentTrack, audioFiles, currentTrackIndex, loadTrackToQueue]);

  const play = useCallback(async () => {
    // Ensure there's a track in the queue before playing
    const hasTrack = await ensureTrackInQueue();
    if (!hasTrack) {
      return;
    }

    await TrackPlayer.play();
  }, [ensureTrackInQueue]);

  const pause = useCallback(async () => {
    await TrackPlayer.pause();
  }, []);

  const fadeOutOnly = useCallback(async (fadeDurationMs: number = 2000) => {
    try {
      // Check if music is actually playing before attempting fade-out
      const playbackState = await TrackPlayer.getPlaybackState();
      const isCurrentlyPlaying = playbackState.state === State.Playing;

      if (!isCurrentlyPlaying) {
        return;
      }

      // Get current volume (default to 1.0 if not available)
      let currentVolume = 1.0;
      try {
        currentVolume = await TrackPlayer.getVolume();
      } catch (volumeError) {
        // Use default volume
      }

      // Use more steps for smoother fade-out
      const steps = 50;
      const stepDuration = fadeDurationMs / steps;
      const volumeStep = currentVolume / steps;

      for (let i = 1; i <= steps; i++) {
        const newVolume = Math.max(0, currentVolume - (volumeStep * i));

        try {
          await TrackPlayer.setVolume(newVolume);
        } catch (volumeError) {
          // If volume control fails, we can't fade out properly
          break;
        }

        // Wait for next step (except on last iteration)
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
      }

    } catch (error) {
      throw error;
    }
  }, []);

  const stopAndClearWithFadeOut = useCallback(async (fadeDurationMs: number = 2000) => {
    try {
      // First fade out the volume
      await fadeOutOnly(fadeDurationMs);

      // Now stop and clear the player
      await TrackPlayer.pause();
      await TrackPlayer.reset();

      // Reset volume back to original level for next track
      try {
        await TrackPlayer.setVolume(1.0);
      } catch (volumeError) {
        // Volume reset failed, continue anyway
      }

      setCurrentTrack(null);
      setIsPlayingState(false);
    } catch (error) {
      // Fallback to immediate stop if fade-out fails
      try {
        await TrackPlayer.pause();
        await TrackPlayer.reset();
        setCurrentTrack(null);
        setIsPlayingState(false);
      } catch (fallbackError) {
        // Both attempts failed
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
    } catch (error) {
      throw error;
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    const playbackState = await TrackPlayer.getPlaybackState();
    if (playbackState.state === State.Playing) {
      await pause();
    } else {
      await play();
    }
  }, [play, pause]);

  const playMeditationTrack = useCallback(async (track: MeditationTrack) => {
    try {
      setIsLoadingMeditationTrack(true);

      // Check if TrackPlayer is ready - if not, throw error immediately
      if (!isSetup) {
        throw new Error('TrackPlayer is not ready. Please wait for the music player to initialize.');
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

    } catch (error) {
      throw error;
    } finally {
      setIsLoadingMeditationTrack(false);
    }
  }, [isSetup]);

  const clearMeditationTracks = useCallback(() => {
    setSelectedMeditationTrack(null);
    setActiveMeditationTrack(null);
    // Also clear the current track to prevent audio tab from showing it as selected
    setCurrentTrack(null);
  }, []);

  const loadAudioFiles = useCallback(async () => {
    try {
      setIsLoadingAudioFiles(true);

      const response = await apiService.getAudioFiles();
      if (response.data) {
        const files = response.data.files;
        setAudioFiles(files);
      } else {
        throw new Error(response.error || 'Failed to load audio files');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingAudioFiles(false);
    }
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
      setIsLoadingTrack(true);

      // Check if TrackPlayer is ready - if not, throw error immediately
      if (!isSetup) {
        throw new Error('TrackPlayer is not ready. Please wait for the music player to initialize.');
      }

      // Convert TrackInfo to Track format for TrackPlayer
      const trackPlayerTrack: Track = {
        id: track.id,
        url: track.url,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        duration: track.duration,
      };

      // Clear current queue and add new track
      try {
        await TrackPlayer.reset();
      } catch (resetError) {
        // Continue anyway, might still work
      }

      await TrackPlayer.add(trackPlayerTrack);

      // Update current track state in context only
      setCurrentTrack(track);

      // Start playing
      await TrackPlayer.play();
      setIsPlayingState(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingTrack(false);
    }
  }, [isSetup]);

  // Auto-load audio files when TrackPlayer is ready
  useEffect(() => {
    if (isSetup && audioFiles.length === 0) {
      loadAudioFiles().catch(() => {
        // Failed to load audio files
      });
    }
  }, [isSetup, audioFiles.length, loadAudioFiles]);

  // Auto-advance to next track when current track ends
  useEffect(() => {
    const handleTrackEnd = async () => {
      if (audioFiles.length > 0) {
        const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
        const nextAudioFile = audioFiles[nextIndex];

        try {
          const track: TrackInfo = {
            id: nextAudioFile.id,
            url: nextAudioFile.audioDownloadUrl,
            title: nextAudioFile.name,
            artist: nextAudioFile.author,
            artwork: nextAudioFile.thumbnailDownloadUrl,
            duration: nextAudioFile.durationSeconds,
          };

          // Update context state and play next track
          setCurrentTrackIndex(nextIndex);
          await playTrack(track);

        } catch (error) {
          // Auto-advance failed
        }
      }
    };

    const sub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, handleTrackEnd);
    return () => {
      sub.remove();
    };
  }, [audioFiles, currentTrackIndex, playTrack]);

  // Update isPlaying state based on TrackPlayer state
  useEffect(() => {
    const updatePlayingState = async () => {
      const playbackState = await TrackPlayer.getPlaybackState();
      const playing = playbackState.state === State.Playing;
      setIsPlayingState(playing);
    };

    // Initial state check
    updatePlayingState();

    // Set up event listeners for state changes
    const stateListener = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
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
      isLoadingTrack,
      isLoadingMeditationTrack,
      isLoadingAudioFiles,
      setupError,
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
      loadAudioFiles,
      setCurrentTrackIndex,
      setCurrentTrack,
      setLoading,
      setFullPlayerVisible,
      nextTrack,
      previousTrack,
      loadTrackToQueue,
      ensureTrackInQueue,
      progress
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};