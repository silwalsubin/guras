import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Image,
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
  setFadeOutStarted
} from '@/store/meditationSliceNew';
import {
  completeGuidedSession,
  updateProgramProgress
} from '@/store/guidedMeditationSlice';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { GuidedMeditationSession } from '@/types/meditation';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width: screenWidth } = Dimensions.get('window');

interface GuidedMeditationPlayerProps {
  session: GuidedMeditationSession;
  onSessionComplete?: (session: GuidedMeditationSession) => void;
  onClose?: () => void;
  forceFullScreen?: boolean;
}

const GuidedMeditationPlayer: React.FC<GuidedMeditationPlayerProps> = ({
  session,
  onSessionComplete,
  onClose,
  forceFullScreen = false,
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const meditationState = useSelector((state: RootState) => state.meditation);
  const { isActive, timeLeft, selectedMinutes, isPaused, fadeOutStarted } = meditationState;

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  const [guidedAudioStarted, setGuidedAudioStarted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const fadeTriggeredRef = useRef(false);

  // Music player context for background music
  const {
    playMeditationTrack,
    pause,
    play,
    stopAndClearWithFadeOut,
    clearMeditationTracks,
    selectedMeditationTrack,
    activeMeditationTrack,
    isPlaying
  } = useMusicPlayer();

  // Timer logic (similar to MeditationTimer but adapted for guided sessions)
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        updateTimer();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeLeft]);

  // Pulse animation for active state
  useEffect(() => {
    if (isActive && !isPaused) {
      const pulseLoop = Animated.loop(
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
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [isActive, isPaused]);

  const updateTimer = () => {
    const newTime = timeLeft - 1;

    // Trigger fade-out 5 seconds before end
    if (newTime === 5 && !fadeOutStarted && !fadeTriggeredRef.current) {
      fadeTriggeredRef.current = true;
      dispatch(setFadeOutStarted(true));
      
      if (activeMeditationTrack) {
        stopAndClearWithFadeOut(5000);
      }
    }

    if (newTime <= 0) {
      // Session finished
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setTimeout(() => {
        dispatch(completeSession());
        clearMeditationTracks();
        setGuidedAudioStarted(false);

        // Track guided meditation progress
        dispatch(completeGuidedSession({
          session,
          rating: 5, // Default rating - in real app this would come from user input
          mood: { before: 3, after: 4 }, // Default mood - in real app this would come from user input
          programId: session.programId,
          programDay: session.programDay,
        }));

        // If this is part of a program, update program progress
        if (session.programId && session.programDay) {
          // TODO: Get total days from program data
          const totalDays = 7; // This should come from the actual program
          dispatch(updateProgramProgress({
            programId: session.programId,
            completedDay: session.programDay,
            totalDays,
          }));
        }

        if (onSessionComplete) {
          onSessionComplete(session);
        }
      }, 1000);
    } else {
      dispatch(updateTimeLeft(newTime));
      updateProgressAnimation();
    }
  };

  const updateProgressAnimation = () => {
    const progress = 1 - (timeLeft / (selectedMinutes * 60));
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleStartSession = async () => {
    const sessionDuration = session.duration;
    dispatch(setSelectedMinutes(sessionDuration));
    dispatch(startTimer(sessionDuration));
    dispatch(setFadeOutStarted(false));
    progressAnimation.setValue(0);

    // Start guided audio
    try {
      console.log('🎵 Starting guided meditation session:', session.title);
      // TODO: Implement guided audio playback
      // This would play the actual guided meditation audio
      setGuidedAudioStarted(true);
      
      // If there's background music selected, play it at lower volume
      if (selectedMeditationTrack) {
        await playMeditationTrack(selectedMeditationTrack);
      }
    } catch (error) {
      console.error('🎵 Failed to start guided session:', error);
      Alert.alert(
        'Audio Notice',
        'Guided meditation audio could not be played, but your session will continue.',
        [{ text: 'OK' }]
      );
    }

    setTimeout(() => {
      updateProgressAnimation();
    }, 100);
  };

  const handlePauseSession = async () => {
    dispatch(pauseTimer());
    
    // Pause both guided audio and background music
    if (isPlaying) {
      try {
        await pause();
      } catch (error) {
        console.error('🎵 Failed to pause session:', error);
      }
    }
  };

  const handleResumeSession = async () => {
    dispatch(resumeTimer());
    
    // Resume both guided audio and background music
    try {
      if (activeMeditationTrack) {
        await playMeditationTrack(activeMeditationTrack);
      } else {
        await play();
      }
    } catch (error) {
      console.error('🎵 Failed to resume session:', error);
    }
  };

  const handleStopSession = () => {
    setShowStopConfirmation(true);
  };

  const confirmStopSession = () => {
    dispatch(stopTimer());
    clearMeditationTracks();
    setGuidedAudioStarted(false);
    setShowStopConfirmation(false);
    
    if (onClose) {
      onClose();
    }
  };

  const getSessionProgress = () => {
    if (selectedMinutes === 0) return 0;
    return ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'stress-relief': return 'heart';
      case 'sleep': return 'moon-o';
      case 'focus': return 'eye';
      case 'anxiety': return 'shield';
      case 'gratitude': return 'smile-o';
      case 'mindfulness': return 'leaf';
      case 'compassion': return 'heart-o';
      case 'body-scan': return 'user-o';
      default: return 'circle';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="times" size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          Guided Session
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Session Info */}
      <View style={[styles.sessionInfo, { backgroundColor: themeColors.card }]}>
        <View style={styles.sessionHeader}>
          {session.thumbnailUrl ? (
            <Image source={{ uri: session.thumbnailUrl }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnailPlaceholder, { backgroundColor: brandColors.primary + '20' }]}>
              <Icon name={getThemeIcon(session.theme)} size={24} color={brandColors.primary} />
            </View>
          )}
          
          <View style={styles.sessionDetails}>
            <Text style={[styles.sessionTitle, { color: themeColors.textPrimary }]}>
              {session.title}
            </Text>
            <Text style={[styles.teacherName, { color: themeColors.textSecondary }]}>
              with {session.teacher.name}
            </Text>
            <Text style={[styles.sessionMeta, { color: themeColors.textSecondary }]}>
              {session.duration} min • {session.theme.replace('-', ' ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Animated.View 
          style={[
            styles.timerCircle,
            { 
              backgroundColor: themeColors.card,
              transform: [{ scale: pulseAnimation }]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.progressRing,
              {
                borderColor: brandColors.primary,
                transform: [
                  {
                    rotate: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
          
          <View style={styles.timerContent}>
            <Text style={[styles.timeDisplay, { color: themeColors.textPrimary }]}>
              {formatTime(timeLeft)}
            </Text>
            {isActive && (
              <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                {getSessionProgress().toFixed(0)}% Complete
              </Text>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: brandColors.primary }]}
            onPress={handleStartSession}
          >
            <Icon name="play" size={24} color="white" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            {!isPaused ? (
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: themeColors.card }]}
                onPress={handlePauseSession}
              >
                <Icon name="pause" size={20} color={themeColors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: brandColors.primary }]}
                onPress={handleResumeSession}
              >
                <Icon name="play" size={20} color="white" />
              </TouchableOpacity>
            )}
            
            {isPaused && (
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: themeColors.card }]}
                onPress={handleStopSession}
              >
                <Text style={[styles.discardText, { color: themeColors.textPrimary }]}>
                  Discard Session
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Stop Confirmation Modal */}
      {showStopConfirmation && (
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmationModal, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.confirmationTitle, { color: themeColors.textPrimary }]}>
              End Session?
            </Text>
            <Text style={[styles.confirmationText, { color: themeColors.textSecondary }]}>
              Your progress will not be saved.
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationButton, { backgroundColor: themeColors.background }]}
                onPress={() => setShowStopConfirmation(false)}
              >
                <Text style={[styles.confirmationButtonText, { color: themeColors.textPrimary }]}>
                  Continue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, { backgroundColor: '#FF6B6B' }]}
                onPress={confirmStopSession}
              >
                <Text style={[styles.confirmationButtonText, { color: 'white' }]}>
                  End Session
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  sessionInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 14,
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerContent: {
    alignItems: 'center',
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  controls: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  discardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    margin: 32,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmationButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GuidedMeditationPlayer;
