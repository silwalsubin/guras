import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import TrackPlayer, { State, useProgress, Capability, Event, Track, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { AudioFile, apiService } from '@/services/api';
import { LocalAudioFile } from '@/services/downloadService';
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
  playLocalTrack: (localFile: LocalAudioFile) => Promise<void>;
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
          // Enable background playback
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

      const startTime = new Date().toISOString().substring(11, 23);
      console.log(`🎵 [${startTime}] Starting volume-based fade-out over ${fadeDurationMs}ms`);

      // Get current volume
      let currentVolume = 1.0;
      try {
        currentVolume = await TrackPlayer.getVolume();
        console.log(`🎵 [${startTime}] Current volume: ${currentVolume}`);
      } catch (volumeError) {
        console.log(`🎵 [${startTime}] Could not get current volume, using 1.0`);
        currentVolume = 1.0;
      }

      // Volume-based fade with more steps for smoother transition
      const steps = 20; // 20 steps for smoother fade
      const stepDuration = fadeDurationMs / steps; // e.g., 5000ms / 20 = 250ms per step
      const volumeStep = currentVolume / steps; // e.g., 1.0 / 20 = 0.05 per step

      console.log(`🎵 [${startTime}] Volume fade: ${steps} steps, ${stepDuration}ms per step, -${volumeStep.toFixed(3)} volume per step`);

      return new Promise<void>((resolve) => {
        let currentStep = 0;

        // Exception to Augment rule: setInterval is necessary for smooth audio volume fading
        const fadeInterval = setInterval(async () => {
          currentStep++;
          const newVolume = Math.max(0, currentVolume - (volumeStep * currentStep));

          try {
            await TrackPlayer.setVolume(newVolume);

            // Log every few steps to avoid spam
            if (currentStep % 4 === 0 || currentStep === steps || newVolume <= 0) {
              const stepTime = new Date().toISOString().substring(11, 23);
              console.log(`🎵 [${stepTime}] Volume step ${currentStep}/${steps}: ${newVolume.toFixed(3)}`);
            }
          } catch (volumeError) {
            const errorTime = new Date().toISOString().substring(11, 23);
            console.error(`🎵 [${errorTime}] Volume control failed:`, volumeError);
            clearInterval(fadeInterval);
            resolve();
            return;
          }

          if (currentStep >= steps || newVolume <= 0) {
            clearInterval(fadeInterval);

            // Ensure final volume is 0
            try {
              await TrackPlayer.setVolume(0);
              const completeTime = new Date().toISOString().substring(11, 23);
              console.log(`🎵 [${completeTime}] Volume fade completed - final volume: 0`);
            } catch (finalError) {
              const errorTime = new Date().toISOString().substring(11, 23);
              console.log(`🎵 [${errorTime}] Volume fade completed (final set failed)`);
            }

            resolve();
          }
        }, stepDuration);
      });

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

      // If TrackPlayer isn't ready, wait and retry (keeps loading state active)
      if (!isSetup) {
        let retries = 0;
        const maxRetries = 10;

        while (!isSetup && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }

        if (!isSetup) {
          throw new Error('Audio player is not ready. Please try again.');
        }
      }

      // Verify TrackPlayer is actually responsive (with retry)
      try {
        await TrackPlayer.getPlaybackState();
      } catch (stateError) {
        // Keep loading state and retry once
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await TrackPlayer.getPlaybackState();
        } catch (retryError) {
          throw new Error('Audio player is not responding. Please try again.');
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

      // Clear queue and add new track first - ensure operations succeed
      await TrackPlayer.reset();
      await TrackPlayer.add(trackPlayerTrack);

      // Update states ONLY after successful queue operations
      setActiveMeditationTrack(track);
      setCurrentTrack(trackPlayerTrack);

      // Start playing
      await TrackPlayer.play();

      // Verify playback state after a brief delay
      setTimeout(async () => {
        try {
          const state = await TrackPlayer.getPlaybackState();
          setIsPlayingState(state.state === State.Playing);
        } catch (verifyError) {
          // State verification failed, but don't throw - playback might still work
          setIsPlayingState(false);
        }
      }, 300);

    } catch (error) {
      // Reset states on error to prevent stale UI state
      setActiveMeditationTrack(null);
      setCurrentTrack(null);
      setIsPlayingState(false);
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

      // If TrackPlayer isn't ready, wait and retry (keeps loading state active)
      if (!isSetup) {
        let retries = 0;
        const maxRetries = 10;

        while (!isSetup && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }

        if (!isSetup) {
          throw new Error('Audio player is not ready. Please try again.');
        }
      }

      // Verify TrackPlayer is actually responsive (with retry)
      try {
        await TrackPlayer.getPlaybackState();
      } catch (stateError) {
        // Keep loading state and retry once
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await TrackPlayer.getPlaybackState();
        } catch (retryError) {
          throw new Error('Audio player is not responding. Please try again.');
        }
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

      // Clear current queue and add new track - ensure both operations succeed
      await TrackPlayer.reset();
      await TrackPlayer.add(trackPlayerTrack);

      // Update current track state ONLY after successful queue operations
      setCurrentTrack(track);

      // Start playing
      await TrackPlayer.play();

      // Verify playback state after a brief delay to ensure it actually started
      setTimeout(async () => {
        try {
          const state = await TrackPlayer.getPlaybackState();
          setIsPlayingState(state.state === State.Playing);
        } catch (verifyError) {
          // State verification failed, but don't throw - playback might still work
          setIsPlayingState(false);
        }
      }, 300);

    } catch (error) {
      // Reset states on error to prevent stale UI state
      setCurrentTrack(null);
      setIsPlayingState(false);
      throw error;
    } finally {
      setIsLoadingTrack(false);
    }
  }, [isSetup]);

  const playLocalTrack = useCallback(async (localFile: LocalAudioFile) => {
    try {
      setIsLoadingTrack(true);

      // Check if TrackPlayer is ready
      if (!isSetup) {
        let retries = 0;
        const maxRetries = 10;

        while (!isSetup && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }

        if (!isSetup) {
          throw new Error('Audio player is not ready. Please try again.');
        }
      }

      // Verify TrackPlayer is responsive
      try {
        await TrackPlayer.getPlaybackState();
      } catch (stateError) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await TrackPlayer.getPlaybackState();
        } catch (retryError) {
          throw new Error('Audio player is not responding. Please try again.');
        }
      }

      // Use local file path if available, otherwise fall back to remote URL
      const audioUrl = localFile.localAudioPath || localFile.audioDownloadUrl;
      const artworkUrl = localFile.localThumbnailPath || localFile.thumbnailDownloadUrl;

      // Convert LocalAudioFile to Track format for TrackPlayer
      const trackPlayerTrack: Track = {
        id: localFile.id,
        url: audioUrl,
        title: localFile.name,
        artist: localFile.author,
        artwork: artworkUrl,
        duration: localFile.durationSeconds,
      };

      // Clear current queue and add new track
      await TrackPlayer.reset();
      await TrackPlayer.add(trackPlayerTrack);

      // Update current track state ONLY after successful queue operations
      const trackInfo: TrackInfo = {
        id: localFile.id,
        title: localFile.name,
        artist: localFile.author,
        url: audioUrl,
        artwork: artworkUrl,
        duration: localFile.durationSeconds,
      };
      setCurrentTrack(trackInfo);

      // Start playing
      await TrackPlayer.play();

      // Verify playback state after a brief delay
      setTimeout(async () => {
        try {
          const state = await TrackPlayer.getPlaybackState();
          setIsPlayingState(state.state === State.Playing);
        } catch (verifyError) {
          setIsPlayingState(false);
        }
      }, 300);

    } catch (error) {
      // Reset states on error to prevent stale UI state
      setCurrentTrack(null);
      setIsPlayingState(false);
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

  // Refresh audio files periodically to prevent stale URLs (every 30 minutes)
  useEffect(() => {
    if (isSetup && audioFiles.length > 0) {
      const refreshInterval = setInterval(() => {
        loadAudioFiles().catch(() => {
          // Failed to refresh audio files, keep existing ones
        });
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(refreshInterval);
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
      playLocalTrack,
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