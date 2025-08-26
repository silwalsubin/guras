import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedMinutes } from '@/store/meditationSliceNew';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import Icon from 'react-native-vector-icons/FontAwesome';

interface DurationSelectorProps {
  selectedDuration: number;
  onDurationSelect: (minutes: number) => void;
  disabled?: boolean;
}

// Haptic feedback helper
const triggerHapticFeedback = () => {
  try {
    if (Platform.OS === 'ios') {
      // Light vibration for iOS selection feedback
      Vibration.vibrate(10);
    } else if (Platform.OS === 'android') {
      // Short vibration for Android
      Vibration.vibrate(50);
    }
  } catch (error) {
    // Silently fail if vibration not available
  }
};

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
  const visibleItems = 5; // Show 5 items at a time (2 above + 1 selected + 2 below)
  const containerHeight = itemHeight * visibleItems;

  // Animation values for smooth transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Scroll to selected value on mount
    const index = data.indexOf(selectedValue);
    if (index !== -1 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * itemHeight,
          animated: true,
        });
      }, 100);
    }
  }, [selectedValue, data]);

  // Continuous scroll handler for immediate visual feedback
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const value = data[index];
    if (value !== undefined && value !== selectedValue) {
      onValueChange(value);
    }
  };

  // Momentum end handler for haptic feedback and final animations
  const handleMomentumScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const value = data[index];
    if (value !== undefined) {
      // Trigger haptic feedback on final selection
      triggerHapticFeedback();

      // Animate highlight pulse for final selection
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 0.8,
          duration: 80,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }),
      ]).start();

      // Ensure final value is set
      if (value !== selectedValue) {
        onValueChange(value);
      }
    }
  };

  const getItemOpacity = (item: number, index: number) => {
    const selectedIndex = data.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.7;
    if (distance === 2) return 0.4;
    return 0.15;
  };

  const getItemScale = (item: number, index: number) => {
    const selectedIndex = data.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    if (distance === 0) return 1.1;
    if (distance === 1) return 0.9;
    return 0.7;
  };

  const getItemFontWeight = (item: number, index: number) => {
    const selectedIndex = data.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    if (distance === 0) return '700';
    if (distance === 1) return '500';
    return '400';
  };

  return (
    <Animated.View
      style={[
        styles.wheelContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      {/* Selection highlight background with animation */}
      <Animated.View style={[
        styles.wheelSelectionHighlight,
        {
          backgroundColor: highlightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [
              isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
            ],
          }),
          top: itemHeight * 2,
          height: itemHeight,
          borderRadius: 12,
          shadowColor: isDarkMode ? '#fff' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: highlightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.1],
          }),
          shadowRadius: 4,
          elevation: 2,
        }
      ]} />

      <ScrollView
        ref={scrollViewRef}
        style={[styles.wheelScrollView, { height: containerHeight }]}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: itemHeight * 2,
        }}
      >
        {data.map((item, index) => {
          const isSelected = item === selectedValue;
          return (
            <Animated.View
              key={index}
              style={[
                styles.wheelItem,
                {
                  height: itemHeight,
                  transform: [{ scale: getItemScale(item, index) }],
                }
              ]}
            >
              <Animated.Text
                style={[
                  styles.wheelItemText,
                  {
                    color: isSelected
                      ? (isDarkMode ? '#fff' : '#000')
                      : themeColors.textPrimary,
                    opacity: getItemOpacity(item, index),
                    fontSize: isSelected ? 26 : 22,
                    fontWeight: getItemFontWeight(item, index),
                    textShadowColor: isSelected
                      ? (isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')
                      : 'transparent',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: isSelected ? 2 : 0,
                  }
                ]}
              >
                {item} min
              </Animated.Text>
            </Animated.View>
          );
        })}
      </ScrollView>
      <Text
        style={[styles.wheelLabel, { color: themeColors.textPrimary }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Animated.View>
  );
};

const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onDurationSelect,
  disabled = false
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(selectedDuration);

  // Animation values for button interactions
  const buttonScale = useRef(new Animated.Value(1)).current;
  const confirmButtonScale = useRef(new Animated.Value(1)).current;

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleConfirmPressIn = () => {
    Animated.spring(confirmButtonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleConfirmPressOut = () => {
    Animated.spring(confirmButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleModalOpen = () => {
    if (!disabled) {
      triggerHapticFeedback();
      setIsModalVisible(true);
    }
  };

  const handleDurationConfirm = () => {
    triggerHapticFeedback();
    onDurationSelect(currentDuration);
    setIsModalVisible(false);
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            {
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
              opacity: disabled ? 0.6 : 1,
              shadowColor: isDarkMode ? '#fff' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}
          onPress={handleModalOpen}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
          disabled={disabled}
          activeOpacity={0.8}
        >
        <View style={styles.selectorContent}>
          <Icon
            name="clock-o"
            size={16}
            color={themeColors.textSecondary}
          />
          <Text style={[
            styles.selectorText,
            {
              color: themeColors.textPrimary,
              fontWeight: '600',
            }
          ]}>
            {selectedDuration} {selectedDuration === 1 ? 'minute' : 'minutes'}
          </Text>
          <Icon
            name="chevron-down"
            size={12}
            color={themeColors.textSecondary}
          />
        </View>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
              Select Duration
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Icon name="times" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Duration Picker */}
          <View style={styles.pickerContainer}>
            <WheelPicker
              data={Array.from({ length: 60 }, (_, i) => i + 1)} // 1-60 minutes
              selectedValue={currentDuration}
              onValueChange={setCurrentDuration}
              label=""
              isDarkMode={isDarkMode}
              themeColors={themeColors}
            />

            {/* Confirm Button */}
            <Animated.View style={{ transform: [{ scale: confirmButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor: brandColors.primary,
                    shadowColor: brandColors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }
                ]}
                onPress={handleDurationConfirm}
                onPressIn={handleConfirmPressIn}
                onPressOut={handleConfirmPressOut}
                activeOpacity={0.9}
              >
                <Text style={styles.confirmButtonText}>
                  Select Duration
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...TYPOGRAPHY.HEADING_SMALL,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginHorizontal: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  wheelContainer: {
    height: 220, // Fixed height for exactly 5 items (44 * 5)
    position: 'relative',
    alignSelf: 'center',
    width: '100%',
  },
  wheelScrollView: {
    height: 220, // Match container height exactly
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
    bottom: -40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
});

export default DurationSelector;
