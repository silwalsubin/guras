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

// Wheel Picker Component
interface WheelPickerProps {
  data: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  label: string;
  isDarkMode: boolean;
  themeColors: any;
}

const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedValue,
  onValueChange,
  label,
  isDarkMode,
  themeColors,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 44;
  const visibleItems = 5; // Show 5 items at a time
  const containerHeight = itemHeight * visibleItems;

  useEffect(() => {
    // Scroll to selected value on mount
    const index = data.indexOf(selectedValue);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * itemHeight,
        animated: false,
      });
    }
  }, [selectedValue, data]);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const value = data[index];
    if (value !== undefined && value !== selectedValue) {
      onValueChange(value);
    }
  };

  const getItemOpacity = (item: number, index: number) => {
    const selectedIndex = data.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.6;
    if (distance === 2) return 0.3;
    return 0.1;
  };

  const getItemScale = (item: number, index: number) => {
    const selectedIndex = data.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.8;
    return 0.6;
  };

  return (
    <View style={styles.wheelContainer}>
      {/* Selection highlight background */}
      <View style={[
        styles.wheelSelectionHighlight,
        {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          top: itemHeight * 2,
          height: itemHeight,
        }
      ]} />

      <ScrollView
        ref={scrollViewRef}
        style={[styles.wheelScrollView, { height: containerHeight }]}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{
          paddingVertical: itemHeight * 2,
        }}
      >
        {data.map((item, index) => (
          <View key={index} style={[styles.wheelItem, { height: itemHeight }]}>
            <Text
              style={[
                styles.wheelItemText,
                {
                  color: themeColors.textPrimary,
                  opacity: getItemOpacity(item, index),
                  fontSize: 24,
                  fontWeight: item === selectedValue ? '600' : '400',
                  transform: [{ scale: getItemScale(item, index) }],
                }
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
      <Text style={[styles.wheelLabel, { color: themeColors.textPrimary }]}>
        {label}
      </Text>
    </View>
  );
};

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
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(6);
  const [seconds, setSeconds] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;



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
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    if (totalMinutes <= 0) return;

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const displayTime = totalSeconds < 60
      ? `${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`
      : totalSeconds < 3600
      ? `${Math.floor(totalSeconds / 60)} minute${Math.floor(totalSeconds / 60) !== 1 ? 's' : ''}`
      : `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;

    Alert.alert(
      'Start Meditation Session',
      `Are you ready to begin your ${displayTime} meditation session?\n\nFind a comfortable position and focus on your breath.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start',
          style: 'default',
          onPress: () => {
            dispatch(setSelectedMinutes(Math.ceil(totalMinutes)));
            dispatch(startTimer(Math.ceil(totalMinutes)));
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



  return (
    <BaseCard style={styles.container}>


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

      {/* Timer Selection */}
      {!isActive && (
        <View style={styles.timerSelection}>
          <View style={[
            styles.wheelPickerContainer,
            {
              backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: 16,
            }
          ]}>
            <WheelPicker
              data={Array.from({ length: 24 }, (_, i) => i)}
              selectedValue={hours}
              onValueChange={setHours}
              label="hours"
              isDarkMode={isDarkMode}
              themeColors={themeColors}
            />
            <WheelPicker
              data={Array.from({ length: 60 }, (_, i) => i)}
              selectedValue={minutes}
              onValueChange={setMinutes}
              label="min"
              isDarkMode={isDarkMode}
              themeColors={themeColors}
            />
            <WheelPicker
              data={Array.from({ length: 60 }, (_, i) => i)}
              selectedValue={seconds}
              onValueChange={setSeconds}
              label="sec"
              isDarkMode={isDarkMode}
              themeColors={themeColors}
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
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  }
                ]}
                onPress={handlePauseTimer}
              >
                <Icon name="pause" size={28} color={themeColors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Skip Controls */}
          <View style={styles.skipControlsContainer}>
            <TouchableOpacity
              style={[
                styles.enhancedSkipButton,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}
              onPress={() => handleSkipTime(-60)}
            >
              <Icon name="minus" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.enhancedSkipButtonText, { color: themeColors.textSecondary }]}>
                1m
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.enhancedSkipButton,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}
              onPress={() => handleSkipTime(60)}
            >
              <Icon name="plus" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.enhancedSkipButtonText, { color: themeColors.textSecondary }]}>
                1m
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stop Section */}
          <View style={styles.stopSection}>
            <TouchableOpacity
              style={[
                styles.enhancedStopButton,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}
              onPress={handleStopTimer}
            >
              <Icon name="stop" size={18} color={themeColors.textSecondary} style={styles.stopIcon} />
              <Text style={[styles.enhancedStopButtonText, { color: themeColors.textSecondary }]}>
                Stop Session
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}


    </BaseCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 28,
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
  timerSelection: {
    marginBottom: 28,
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
    marginTop: 32,
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
    // No border for resume button
  },
  playIconOffset: {
    marginLeft: 3, // Slight offset to center play icon visually
  },
  skipControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  enhancedSkipButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedSkipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  stopSection: {
    alignItems: 'center',
    marginTop: 8,
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
  stopIcon: {
    marginRight: 8,
  },
  enhancedStopButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Wheel Picker Styles
  wheelPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 220,
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  wheelContainer: {
    flex: 1,
    height: 220,
    position: 'relative',
    marginHorizontal: 5,
  },
  wheelScrollView: {
    flex: 1,
  },
  wheelSelectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    pointerEvents: 'none',
    borderRadius: 8,
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    textAlign: 'center',
    fontFamily: 'System',
  },
  wheelLabel: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
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

