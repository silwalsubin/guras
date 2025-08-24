import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  updateTimeLeft,
  setSelectedMinutes,
  completeSession,
  syncTimerState
} from '@/store/meditationSliceNew';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';

import Icon from 'react-native-vector-icons/FontAwesome';
import { useMusicPlayer, MeditationTrack } from '@/contexts/MusicPlayerContext';
import MeditationMusicSelector from '@/components/shared/MeditationMusicSelector';
// No Redux music control - MusicPlayerContext handles everything
import DurationSelector from '@/components/shared/DurationSelector';

interface MeditationTimerProps {
  onSessionComplete?: (duration: number) => void;
  forceFullScreen?: boolean; // Override Redux isFullScreen state
}

const { width: screenWidth } = Dimensions.get('window');



const MeditationTimer: React.FC<MeditationTimerProps> = ({ onSessionComplete, forceFullScreen }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  // Get meditation state from Redux
  const meditationState = useSelector((state: RootState) => state.meditation);
  const {
    isActive,
    timeLeft,
    selectedMinutes,
    isPaused,
    totalSessions,
    totalMinutes,
    isFullScreen
  } = meditationState;

  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  const [minutes, setMinutes] = useState(10);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Music player context - single source of truth for music control
  const {
    playTrack,
    playMeditationTrack,
    play,
    pause,
    stopAndClearWithFadeOut,
    fadeOutOnly,
    isPlaying,
    selectedMeditationTrack,
    activeMeditationTrack,
    setSelectedMeditationTrack,
    clearMeditationTracks
  } = useMusicPlayer();



  // Sync timer state when component mounts and when returning to tab
  // TEMPORARILY DISABLED to fix natural completion
  // useEffect(() => {
  //   dispatch(syncTimerState());

  //   // Set up periodic sync every 5 seconds to handle tab switches
  //   const syncInterval = setInterval(() => {
  //     if (isActive && !isPaused) {
  //       dispatch(syncTimerState());
  //     }
  //   }, 5000);

  //   return () => clearInterval(syncInterval);
  // }, [dispatch, isActive, isPaused]);

  // Timer logic - use callback ref to avoid recreating interval
  const timerCallbackRef = useRef<() => void>(() => {});
  const fadeOutStartedRef = useRef(false);

  // Update the callback ref with current values
  timerCallbackRef.current = () => {
    const newTime = timeLeft - 1;
    console.log('⏰ Timer tick:', { timeLeft, newTime, isActive, isPaused });

    // Start fade-out when 5 seconds remain (but only once)
    if (newTime === 5 && !fadeOutStartedRef.current) {
      console.log('🎯 TIMER: 5 seconds remaining - STARTING FADE-OUT...');
      console.log('🎯 TIMER: Current playing state:', isPlaying);
      console.log('🎯 TIMER: Active meditation track:', activeMeditationTrack?.title);
      fadeOutStartedRef.current = true;

      // Start fade-out asynchronously (only fade volume, don't stop track yet)
      const startFadeOut = async () => {
        try {
          console.log('🎯 TIMER: Calling fadeOutOnly with 5000ms duration...');
          await fadeOutOnly(5000); // 5 second fade-out
          console.log('✅ TIMER: Music fade-out completed successfully');
        } catch (error) {
          console.error('❌ TIMER: Failed to fade out music:', error);
        }
      };

      startFadeOut(); // Don't await this
    }

    if (newTime <= 0) {
      // Timer finished - handle completion immediately
      console.log('🎯 TIMER REACHED ZERO - Completing session...');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset fade-out flag for next session
      fadeOutStartedRef.current = false;

      // Dispatch completion immediately
      dispatch(completeSession());
      console.log('🎯 MEDITATION COMPLETED');

      // Stop and clear the music (volume should already be at 0 from fade-out)
      const stopMusic = async () => {
        try {
          await stopAndClearWithFadeOut(0); // No additional fade needed, just stop
          console.log('✅ Music stopped and cleared');
        } catch (error) {
          console.error('❌ Failed to stop music:', error);
        }
      };

      stopMusic(); // Don't await this

      // Clear meditation tracks from context
      clearMeditationTracks();

      if (onSessionComplete) {
        onSessionComplete(selectedMinutes);
      }
    } else {
      dispatch(updateTimeLeft(newTime));
      updateProgressAnimation();
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0 && !isPaused && !showStopConfirmation) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          timerCallbackRef.current?.();
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, showStopConfirmation]);

  // Sync local minutes state with Redux selectedMinutes
  useEffect(() => {
    setMinutes(selectedMinutes);
  }, [selectedMinutes]);

  // Sync progress animation when meditation state changes
  useEffect(() => {
    if (isActive) {
      updateProgressAnimation();
    } else {
      progressAnimation.setValue(0);
    }
  }, [isActive, timeLeft, selectedMinutes]);

  // Pulsing animation
  useEffect(() => {
    if (isActive && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isActive, isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = (): number => {
    if (selectedMinutes <= 0) return 0;
    const totalSeconds = selectedMinutes * 60;
    const elapsed = totalSeconds - timeLeft;
    const progress = elapsed / totalSeconds;
    return progress * 100;
  };

  const updateProgressAnimation = () => {
    if (selectedMinutes <= 0) return;
    const totalSeconds = selectedMinutes * 60;
    const elapsed = totalSeconds - timeLeft;
    const progress = elapsed / totalSeconds;

    console.log('🎯 Progress Debug:', {
      selectedMinutes,
      totalSeconds,
      timeLeft,
      elapsed,
      progress: (progress * 100).toFixed(1) + '%',
      animationValue: progress
    });

    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handleStartTimer = async () => {
    if (minutes <= 0) return;

    // Reset fade-out flag for new session
    fadeOutStartedRef.current = false;

    // Debug: Check what meditation track is selected
    console.log('🎵 DEBUG: Starting meditation with track:', selectedMeditationTrack);
    console.log('🎵 DEBUG: Start button pressed, selectedMeditationTrack:', selectedMeditationTrack);

    dispatch(setSelectedMinutes(minutes));
    dispatch(startTimer(minutes));
    progressAnimation.setValue(0);

    // Initial progress update
    setTimeout(() => {
      updateProgressAnimation();
    }, 100);

    // Start meditation music if selected
    if (selectedMeditationTrack) {
      try {
        console.log('🎵 Attempting to play meditation music:', {
          title: selectedMeditationTrack.title,
          url: selectedMeditationTrack.url,
          category: selectedMeditationTrack.category
        });

        // Use the centralized meditation track player
        await playMeditationTrack(selectedMeditationTrack);
        console.log('🎵 Successfully started meditation music:', selectedMeditationTrack.title);
      } catch (error) {
        console.error('🎵 Failed to start meditation music:', error);
        // Continue with meditation even if music fails
        Alert.alert(
          'Audio Notice',
          'Meditation music could not be played, but your session will continue in silence.',
          [{ text: 'OK' }]
        );
      }
    } else {
      console.log('🎵 No meditation music selected - silent meditation');
    }
  };

  const handlePauseTimer = async () => {
    dispatch(pauseTimer());

    // Pause meditation music - let MusicPlayerContext handle the state
    if (isPlaying) {
      try {
        await pause();
        console.log('🎵 Paused meditation music');
        console.log('🎵 Active meditation track preserved:', !!activeMeditationTrack);
      } catch (error) {
        console.error('🎵 Failed to pause meditation music:', error);
      }
    }
  };

  const handleResumeTimer = async () => {
    console.log('🎵 RESUME BUTTON CLICKED!');
    dispatch(resumeTimer());

    // Resume meditation music using centralized state
    console.log('🎵 Resume - selectedMeditationTrack:', !!selectedMeditationTrack);
    console.log('🎵 Resume - activeMeditationTrack:', !!activeMeditationTrack);
    console.log('🎵 Resume - isPlaying:', isPlaying);

    try {
      if (activeMeditationTrack) {
        // We have an active meditation track, try to resume
        console.log('🎵 Resuming active meditation track...');

        // Use context's playMeditationTrack which handles queue management
        await playMeditationTrack(activeMeditationTrack);

        console.log('🎵 Resumed meditation music successfully');
      } else if (selectedMeditationTrack) {
        // No active track but we have a selected track, start it
        console.log('🎵 No active track, starting selected meditation track...');
        await playMeditationTrack(selectedMeditationTrack);
        console.log('🎵 Started meditation music successfully');
      } else {
        // Try to play any available track using context's play method
        console.log('🎵 No meditation tracks, attempting to play any available track...');
        try {
          await play();
          console.log('🎵 Successfully started playback');
        } catch (error) {
          console.log('🎵 No tracks available to play');
        }
      }
    } catch (error) {
      console.error('🎵 Failed to resume meditation music:', error);
    }
  };

  const handleStopTimer = async () => {
    dispatch(stopTimer());
    setShowStopConfirmation(false);

    // Stop and clear meditation music with fade-out
    try {
      await stopAndClearWithFadeOut(1500); // 1.5 second fade-out for manual stop
      console.log('🎵 Faded out and cleared meditation music');
    } catch (error) {
      console.error('🎵 Failed to fade out meditation music:', error);
    }

    // Clear meditation tracks from context
    clearMeditationTracks();
  };






  // Use forceFullScreen prop if provided, otherwise fall back to Redux state
  const shouldUseFullScreen = forceFullScreen !== undefined ? forceFullScreen : isFullScreen;

  return (
    <View style={shouldUseFullScreen ? styles.fullScreenContainer : styles.container}>


      {/* Timer Display - Only show when meditation is active */}
      {isActive && (
        <View style={styles.timerDisplay}>
          <View style={styles.timerContainer}>
            <Animated.View style={[
              isFullScreen ? styles.progressCircleFullScreen : styles.progressCircle,
              { transform: [{ scale: pulseAnimation }] }
            ]}>
              {/* Background circle */}
              <View style={isFullScreen ? styles.progressBackgroundFullScreen : styles.progressBackground} />

              {/* Simple progress circle - fixed approach */}
              <Animated.View
                style={[
                  isFullScreen ? styles.progressFillFullScreen : styles.progressFill,
                  {
                    borderColor: 'transparent',
                    borderTopColor: brandColors.primary,
                    borderRightColor: progressAnimation.interpolate({
                      inputRange: [0, 0.25, 1],
                      outputRange: ['transparent', brandColors.primary, brandColors.primary],
                      extrapolate: 'clamp'
                    }),
                    borderBottomColor: progressAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['transparent', 'transparent', brandColors.primary],
                      extrapolate: 'clamp'
                    }),
                    borderLeftColor: progressAnimation.interpolate({
                      inputRange: [0, 0.75, 1],
                      outputRange: ['transparent', 'transparent', brandColors.primary],
                      extrapolate: 'clamp'
                    }),
                    transform: [{
                      rotate: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-90deg', '270deg']
                      })
                    }]
                  }
                ]}
              />
            </Animated.View>
            <View style={styles.timerOverlay}>
              <Text style={[
                styles.timerText,
                {
                  color: isFullScreen ? '#FFFFFF' : themeColors.textPrimary, // Always white in full-screen
                  fontSize: isFullScreen ? 56 : 42
                }
              ]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={[
                styles.timerLabel,
                {
                  color: isFullScreen ? '#FFFFFF' : themeColors.textSecondary, // Always white in full-screen
                  fontSize: isFullScreen ? 20 : 16
                }
              ]}>
                {isPaused ? 'Paused' : 'Meditating'}
              </Text>
              <Text style={[
                styles.progressText,
                {
                  color: isFullScreen ? '#FFFFFF' : themeColors.textSecondary, // Always white in full-screen
                  fontSize: isFullScreen ? 18 : 14
                }
              ]}>
                {getSessionProgress().toFixed(0)}% Complete
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Duration and Music Selection */}
      {!isActive && (
        <View style={styles.timerSelection}>
          {/* Duration Selector */}
          <DurationSelector
            selectedDuration={minutes}
            onDurationSelect={(selectedMinutes) => setMinutes(selectedMinutes)}
            disabled={false}
          />

          {/* Music Selection */}
          <View style={styles.musicSelectionContainer}>
            <MeditationMusicSelector
              selectedTrack={selectedMeditationTrack}
              onTrackSelect={setSelectedMeditationTrack}
              disabled={false}
            />
          </View>

          {/* Start Button */}
          <View style={styles.startButtonContainer}>
            <TouchableOpacity
              style={[
                styles.circularStartButton,
                {
                  backgroundColor: brandColors.primary,
                  shadowColor: brandColors.primary,
                }
              ]}
              onPress={handleStartTimer}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active Controls */}
      {isActive && (
        <>
          {/* Main Pause Control */}
          <View style={styles.mainControlContainer}>
            {isPaused ? (
              <TouchableOpacity
                style={[
                  styles.circularControlButton,
                  styles.resumeButton,
                  { backgroundColor: brandColors.primary, shadowColor: brandColors.primary }
                ]}
                onPress={handleResumeTimer}
              >
                <Icon name="play" size={28} color="white" style={styles.playIconOffset} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.circularControlButton,
                  styles.pauseButton,
                  {
                    backgroundColor: isFullScreen ? 'rgba(255, 255, 255, 0.1)' : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                    borderColor: isFullScreen ? 'rgba(255, 255, 255, 0.2)' : (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'),
                  }
                ]}
                onPress={handlePauseTimer}
              >
                <Icon name="pause" size={28} color={isFullScreen ? '#FFFFFF' : themeColors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Discard Session - Always reserve space, but only show when paused */}
          <View style={styles.stopSection}>
            <TouchableOpacity
              style={[
                styles.enhancedStopButton,
                {
                  backgroundColor: isFullScreen ? 'rgba(255, 255, 255, 0.08)' : (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'),
                  borderColor: isFullScreen ? 'rgba(255, 255, 255, 0.15)' : (isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'),
                  opacity: isPaused ? 1 : 0, // Hide when not paused, but keep space
                }
              ]}
              onPress={isPaused ? handleStopTimer : undefined}
              disabled={!isPaused}
            >
              <Text style={[styles.enhancedStopButtonText, { color: isFullScreen ? '#FFFFFF' : themeColors.textSecondary }]}>
                Discard Session
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}



    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  fullScreenContainer: {
    flex: 1,
    margin: 0,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },

  timerDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleFullScreen: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: '#E5E7EB',
    position: 'absolute',
  },
  progressBackgroundFullScreen: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: '#E5E7EB',
    position: 'absolute',
  },
  progressFill: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: '#10B981',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressFillFullScreen: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#10B981',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  timerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  timerSelection: {
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  timerSelectorLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickPresets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  presetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 60,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  presetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  extendedOptions: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  extendedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  extendedButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 55,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  extendedText: {
    fontSize: 15,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 16,
    borderWidth: 0,
    marginBottom: 16,
    marginTop: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginRight: 4,
  },
  // Enhanced Control Styles
  mainControlContainer: {
    alignItems: 'center',
    marginTop: 80, // Increased from 32 to move buttons down for thumb accessibility
    marginBottom: 24,
  },
  circularControlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  pauseButton: {
    borderWidth: 1,
  },
  resumeButton: {
    borderWidth: 1,
    borderColor: 'transparent', // Invisible border to maintain same dimensions
  },
  playIconOffset: {
    marginLeft: 3, // Slight offset to center play icon visually
  },

  stopSection: {
    alignItems: 'center',
    marginTop: 16, // Increased from 8 to maintain good spacing with the moved main control
  },
  enhancedStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  enhancedStopButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },


  musicSelectionContainer: {
    marginBottom: 0,
  },
  startButtonContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularStartButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MeditationTimer;

