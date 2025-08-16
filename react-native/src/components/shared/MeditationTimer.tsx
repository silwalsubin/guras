import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  startTimer, 
  pauseTimer, 
  resumeTimer, 
  stopTimer, 
  updateTimeLeft, 
  skipTime, 
  setSelectedMinutes, 
  completeSession,
  syncTimerState
} from '@/store/meditationSliceNew';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { BaseCard } from '@/components/shared';
import Icon from 'react-native-vector-icons/FontAwesome';

interface MeditationTimerProps {
  onSessionComplete?: (duration: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const MeditationTimer: React.FC<MeditationTimerProps> = ({ onSessionComplete }) => {
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
    totalMinutes 
  } = meditationState;

  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Predefined timer options
  const timerOptions = [
    { minutes: 5, label: '5m', description: 'Quick Focus' },
    { minutes: 10, label: '10m', description: 'Daily Practice' },
    { minutes: 15, label: '15m', description: 'Deep Relaxation' },
    { minutes: 20, label: '20m', description: 'Extended Session' },
    { minutes: 30, label: '30m', description: 'Full Practice' },
    { minutes: 45, label: '45m', description: 'Intensive' },
    { minutes: 60, label: '60m', description: 'Complete Session' }
  ];

  // Sync timer state when component mounts and when returning to tab
  useEffect(() => {
    dispatch(syncTimerState());
    
    // Set up periodic sync every 5 seconds to handle tab switches
    const syncInterval = setInterval(() => {
      if (isActive && !isPaused) {
        dispatch(syncTimerState());
      }
    }, 5000);
    
    return () => clearInterval(syncInterval);
  }, [dispatch, isActive, isPaused]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0 && !isPaused && !showStopConfirmation) {
      intervalRef.current = setInterval(() => {
        const newTime = timeLeft - 1;
        
        if (newTime <= 0) {
          // Timer finished
          clearInterval(intervalRef.current!);
          dispatch(completeSession());
          
          if (onSessionComplete) {
            onSessionComplete(selectedMinutes);
          }
          
          Alert.alert(
            'Meditation Complete',
            `Great job! You've completed your ${selectedMinutes}-minute meditation session!\n\nTotal sessions: ${totalSessions + 1}\nTotal minutes: ${totalMinutes + selectedMinutes}`,
            [{ text: 'OK' }]
          );
        } else {
          dispatch(updateTimeLeft(newTime));
          updateProgressAnimation();
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, isPaused, showStopConfirmation, selectedMinutes, onSessionComplete, totalSessions, totalMinutes, dispatch]);

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
    
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handleStartTimer = () => {
    if (selectedMinutes <= 0) return;
    
    Alert.alert(
      'Start Meditation Session',
      `Are you ready to begin your ${selectedMinutes}-minute meditation session?\n\nFind a comfortable position and focus on your breath.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start',
          style: 'default',
          onPress: () => {
            dispatch(startTimer(selectedMinutes));
            progressAnimation.setValue(0);
          },
        },
      ]
    );
  };

  const handlePauseTimer = () => {
    dispatch(pauseTimer());
  };

  const handleResumeTimer = () => {
    dispatch(resumeTimer());
  };

  const handleStopTimer = () => {
    Alert.alert(
      'Stop Meditation',
      'Are you sure you want to stop your meditation session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            dispatch(stopTimer());
            setShowStopConfirmation(false);
          },
        },
      ]
    );
  };

  const handleSkipTime = (seconds: number) => {
    if (!isActive) return;
    dispatch(skipTime(seconds));
  };

  const handleTimeOptionSelect = (minutes: number) => {
    if (!isActive) {
      dispatch(setSelectedMinutes(minutes));
    }
  };

  return (
    <BaseCard style={styles.container}>
      {/* Session Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: brandColors.primary }]}>
            {totalSessions}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Sessions
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: brandColors.primary }]}>
            {totalMinutes}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Minutes
          </Text>
        </View>
      </View>

      {/* Timer Display - Only show when meditation is active */}
      {isActive && (
        <View style={styles.timerDisplay}>
          <View style={styles.timerContainer}>
            <Animated.View style={[styles.progressCircle, { transform: [{ scale: pulseAnimation }] }]}>
              <View style={styles.progressBackground} />
              <Animated.View 
                                  style={[
                    styles.progressFill,
                    {
                      width: 180,
                      height: 180,
                      borderRadius: 90,
                      borderWidth: 6,
                      borderColor: 'transparent',
                      borderTopColor: brandColors.primary,
                      position: 'absolute',
                      top: 0,
                      left: 0,
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
              <Text style={[styles.timerText, { color: themeColors.textPrimary }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={[styles.timerLabel, { color: themeColors.textSecondary }]}>
                {isPaused ? 'Paused' : 'Meditating'}
              </Text>
              <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                {getSessionProgress().toFixed(0)}% Complete
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Timer Options */}
      {!isActive && (
        <View style={styles.timerOptions}>
          <Text style={[styles.optionsLabel, { color: themeColors.textSecondary }]}>
            Choose Duration:
          </Text>
          <View style={styles.optionsGrid}>
            {timerOptions.map((option) => (
              <TouchableOpacity
                key={option.minutes}
                style={[
                  styles.timeOption,
                  {
                    backgroundColor: selectedMinutes === option.minutes 
                      ? brandColors.primary 
                      : themeColors.card,
                    borderColor: selectedMinutes === option.minutes 
                      ? brandColors.primary 
                      : themeColors.border,
                  }
                ]}
                onPress={() => handleTimeOptionSelect(option.minutes)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    {
                      color: selectedMinutes === option.minutes 
                        ? 'white' 
                        : themeColors.textPrimary,
                    }
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.timeOptionDescription,
                    {
                      color: selectedMinutes === option.minutes 
                        ? 'rgba(255, 255, 255, 0.8)' 
                        : themeColors.textSecondary,
                    }
                  ]}
                >
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Active Controls */}
      {isActive && (
        <>
          {/* Main Controls */}
          <View style={styles.controlsContainer}>
            {isPaused ? (
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: brandColors.primary }]}
                onPress={handleResumeTimer}
              >
                <Icon name="play" size={24} color="white" style={styles.buttonIcon} />
                <Text style={[styles.startButtonText, { color: 'white' }]}>
                  Resume
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={handlePauseTimer}
              >
                <Icon name="pause" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            )}

            {/* Skip Controls */}
            <View style={styles.skipControls}>
              <TouchableOpacity
                style={[styles.skipButton, { backgroundColor: themeColors.card, borderWidth: 2, borderColor: themeColors.border }]}
                onPress={() => handleSkipTime(-60)}
              >
                <View style={styles.skipButtonContent}>
                  <Icon name="minus" size={20} color={themeColors.textSecondary} />
                  <Text style={[styles.skipButtonText, { color: themeColors.textSecondary }]}>
                    -1m
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.skipButton, { backgroundColor: themeColors.card, borderWidth: 2, borderColor: themeColors.border }]}
                onPress={() => handleSkipTime(60)}
              >
                <View style={styles.skipButtonContent}>
                  <Icon name="plus" size={18} color={themeColors.textSecondary} />
                  <Text style={[styles.skipButtonText, { color: themeColors.textSecondary }]}>
                    +1m
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stop Section */}
          <View style={styles.stopSection}>
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={handleStopTimer}
            >
              <Icon name="stop" size={20} color={themeColors.textSecondary} style={styles.buttonIcon} />
              <Text style={[styles.stopButtonText, { color: themeColors.textSecondary }]}>
                Stop Session
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Start Button - Only show when not active */}
      {!isActive && (
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: brandColors.primary }]}
          onPress={handleStartTimer}
        >
          <Icon name="play" size={24} color="white" style={styles.buttonIcon} />
          <Text style={[styles.startButtonText, { color: 'white' }]}>
            Start Meditation
          </Text>
        </TouchableOpacity>
      )}
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    marginHorizontal: 16,
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
  progressBackground: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
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
  timerOptions: {
    marginBottom: 24,
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 70,
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeOptionDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  buttonIcon: {
    marginRight: 6,
  },
  controlsContainer: {
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
    marginBottom: 32,
  },
  skipControls: {
    flexDirection: 'row',
    gap: 16,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  stopSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default MeditationTimer;

