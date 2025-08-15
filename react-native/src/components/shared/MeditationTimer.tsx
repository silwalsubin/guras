import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors, getSemanticColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { BaseCard } from '@/components/shared';
import Icon from 'react-native-vector-icons/FontAwesome';
import meditationAudioService from '@/services/meditationAudioService';

interface MeditationTimerProps {
  onSessionComplete?: (duration: number) => void;
}

const MeditationTimer: React.FC<MeditationTimerProps> = ({ onSessionComplete }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const semanticColors = getSemanticColors();

  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<any>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Predefined timer options
  const timerOptions = [5, 10, 15, 20, 30, 45, 60];

  useEffect(() => {
    if (isActive && timeLeft > 0 && !isPaused && !showStopConfirmation) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer finished
            clearInterval(intervalRef.current!);
            setIsActive(false);
            setIsPaused(false);
            playEndSound();
            if (onSessionComplete) {
              onSessionComplete(selectedMinutes);
            }
            Alert.alert(
              'Meditation Complete',
              `Great job! You've completed your ${selectedMinutes}-minute meditation session.`,
              [{ text: 'OK' }]
            );
            return 0;
          }
          const newTime = prevTime - 1;
          // Update progress animation
          setTimeout(() => updateProgressAnimation(), 0);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, isPaused, showStopConfirmation, selectedMinutes, onSessionComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressRotation = (): number => {
    if (selectedMinutes <= 0) return 0;
    const totalSeconds = selectedMinutes * 60;
    const elapsed = totalSeconds - timeLeft;
    const progress = elapsed / totalSeconds;
    return progress * 360; // Convert to degrees (0-360)
  };

  const updateProgressAnimation = () => {
    if (selectedMinutes <= 0) return;
    const totalSeconds = selectedMinutes * 60;
    const elapsed = totalSeconds - timeLeft;
    const progress = elapsed / totalSeconds;
    
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 1000, // Smooth animation over 1 second
      useNativeDriver: false,
    }).start();
  };

  const startTimer = () => {
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
            setTimeLeft(selectedMinutes * 60);
            setIsActive(true);
            setIsPaused(false);
            progressAnimation.setValue(0); // Reset progress to 0
            playStartSound();
          },
        },
      ]
    );
  };

  const pauseTimer = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const stopTimer = () => {
    setShowStopConfirmation(true);
    Alert.alert(
      'Stop Meditation?',
      'Are you sure you want to stop your current meditation session? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setShowStopConfirmation(false),
        },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setShowStopConfirmation(false);
            setIsActive(false);
            setIsPaused(false);
            setTimeLeft(0);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          },
        },
      ]
    );
  };

  const playStartSound = async () => {
    try {
      await meditationAudioService.playStartCue();
    } catch (error) {
      console.error('Failed to play start sound:', error);
    }
  };

  const playEndSound = async () => {
    try {
      await meditationAudioService.playEndCue();
    } catch (error) {
      console.error('Failed to play end sound:', error);
    }
  };

  const handleTimeOptionSelect = (minutes: number) => {
    if (isActive) {
      Alert.alert(
        'Timer Active',
        'Please stop the current timer before selecting a new duration.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedMinutes(minutes);
  };

  return (
    <BaseCard style={styles.container}>
      {/* Timer Display - Only show when meditation is active */}
      {isActive && (
        <View style={styles.timerDisplay}>
          <View style={styles.timerContainer}>
            <View style={styles.progressCircle}>
              <View style={styles.progressBackground} />
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    borderTopColor: brandColors.primary,
                    transform: [{
                      rotate: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }]
                  }
                ]} 
              />
            </View>
            <View style={styles.timerOverlay}>
              <Text style={[styles.timerText, { color: themeColors.textPrimary }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={[styles.timerLabel, { color: themeColors.textSecondary }]}>
                {isPaused ? 'Paused' : 'Meditating'}
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
            {timerOptions.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.timeOption,
                  {
                    backgroundColor: selectedMinutes === minutes 
                      ? brandColors.primary 
                      : themeColors.surface,
                    borderColor: selectedMinutes === minutes 
                      ? brandColors.primary 
                      : themeColors.border,
                  }
                ]}
                onPress={() => handleTimeOptionSelect(minutes)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    {
                      color: selectedMinutes === minutes 
                        ? 'white' 
                        : themeColors.textPrimary,
                    }
                  ]}
                >
                  {minutes}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: brandColors.primary }]}
            onPress={startTimer}
            disabled={selectedMinutes <= 0}
          >
            <Text style={styles.startButtonText}>Start Meditation</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            {isPaused ? (
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: brandColors.primary }]}
                onPress={resumeTimer}
              >
                <Icon name="play" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.controlButton, { 
                  backgroundColor: themeColors.surface,
                  borderWidth: 2,
                  borderColor: themeColors.border 
                }]}
                onPress={pauseTimer}
              >
                <Icon name="pause" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: themeColors.surface, borderWidth: 2, borderColor: themeColors.border }]}
              onPress={stopTimer}
            >
              <Icon name="stop" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Instructions */}
      {!isActive && (
        <View style={styles.instructions}>
          <Text style={[styles.instructionsText, { color: themeColors.textSecondary }]}>
            Choose your meditation duration and find a comfortable position. 
            The timer will play gentle sounds to mark the beginning and end of your session.
          </Text>
        </View>
      )}
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    position: 'absolute',
  },
  progressFill: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: 'transparent',
    position: 'absolute',
    transform: [{ rotate: '-90deg' }], // Start from top
  },
  timerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    fontFamily: 'System',
    marginBottom: 8,
  },
  timerLabel: {
    ...TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
  },
  timerOptions: {
    marginBottom: 32,
  },
  optionsLabel: {
    ...TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  timeOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  timeOptionText: {
    ...TYPOGRAPHY.BUTTON_SMALL,
  },
  controls: {
    marginBottom: 24,
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
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
    ...TYPOGRAPHY.BUTTON,
    color: 'white',
    fontWeight: '600',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeControls: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },

  instructions: {
    paddingHorizontal: 16,
  },
  instructionsText: {
    ...TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MeditationTimer;
