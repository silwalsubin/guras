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
  Platform,
  Vibration,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
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

// Popular meditation durations organized by category
const getDurationCategories = () => {
  return {
    quick: [3, 5, 7, 10],
    standard: [15, 20, 25, 30],
    extended: [45, 60, 90, 120]
  };
};

// Duration Grid Component
interface DurationGridProps {
  selectedValue: number;
  onValueChange: (value: number) => void;
  onClose?: () => void;
  isDarkMode: boolean;
  themeColors: any;
  brandColors: any;
}

const DurationGrid: React.FC<DurationGridProps> = ({
  selectedValue,
  onValueChange,
  onClose,
  isDarkMode,
  themeColors,
  brandColors,
}) => {
  const categories = getDurationCategories();
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Animation values for button interactions
  const buttonAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;

  // Initialize button animations
  const getButtonAnimation = (duration: number) => {
    if (!buttonAnimations[duration]) {
      buttonAnimations[duration] = new Animated.Value(1);
    }
    return buttonAnimations[duration];
  };

  const handleButtonPress = (duration: number) => {
    triggerHapticFeedback();

    // Animate button press
    const animation = getButtonAnimation(duration);
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Immediately select the duration and close modal
    onValueChange(duration);
    if (onClose) {
      onClose();
    }
  };

  const handleCustomSubmit = () => {
    const duration = parseInt(customDuration);
    if (duration && duration > 0 && duration <= 999) {
      handleButtonPress(duration);
      setShowCustomInput(false);
      setCustomDuration('');
    }
  };

  const handleRemoveCustomDuration = (duration: number) => {
    triggerHapticFeedback();

    // If the custom duration being removed is currently selected,
    // switch to a default duration (10 minutes)
    if (duration === selectedValue) {
      onValueChange(10);
    }
  };

  const renderDurationButton = (duration: number, isCustom = false) => {
    const isSelected = duration === selectedValue;
    const animation = getButtonAnimation(duration);

    return (
      <Animated.View
        key={duration}
        style={[
          styles.durationButton,
          {
            backgroundColor: isSelected ? brandColors.primary : themeColors.cardBackground,
            borderColor: isSelected ? brandColors.primary : themeColors.border,
            transform: [{ scale: animation }],
          }
        ]}
      >
        <TouchableOpacity
          style={styles.durationButtonInner}
          onPress={() => handleButtonPress(duration)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.durationButtonText,
            {
              color: isSelected ? 'white' : themeColors.textPrimary,
              fontWeight: isSelected ? '600' : '500',
            }
          ]}>
            {duration}
          </Text>
          <Text style={[
            styles.durationButtonLabel,
            {
              color: isSelected ? 'rgba(255,255,255,0.8)' : themeColors.textSecondary,
            }
          ]}>
            min{duration !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>

        {/* Remove button for custom durations */}
        {isCustom && (
          <TouchableOpacity
            style={[
              styles.removeButton,
              { backgroundColor: isSelected ? 'rgba(255,255,255,0.9)' : '#ff4444' }
            ]}
            onPress={() => handleRemoveCustomDuration(duration)}
            activeOpacity={0.7}
          >
            <Icon
              name="times"
              size={14}
              color={isSelected ? brandColors.primary : 'white'}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderCategorySection = (title: string, durations: number[]) => (
    <View key={title} style={styles.categorySection}>
      <Text style={[styles.categoryTitle, { color: themeColors.textSecondary }]}>
        {title}
      </Text>
      <View style={styles.durationGrid}>
        {durations.map(duration => renderDurationButton(duration))}
      </View>
    </View>
  );

  // Check if current selection is a custom duration
  const allStandardDurations = [
    ...categories.quick,
    ...categories.standard,
    ...categories.extended
  ];
  const isCustomDuration = !allStandardDurations.includes(selectedValue);

  return (
    <ScrollView style={styles.durationContainer} showsVerticalScrollIndicator={false}>
      {/* Quick Sessions */}
      {renderCategorySection('Quick Sessions', categories.quick)}

      {/* Standard Sessions */}
      {renderCategorySection('Standard Sessions', categories.standard)}

      {/* Extended Sessions */}
      {renderCategorySection('Extended Sessions', categories.extended)}

      {/* Custom Duration Section */}
      <View style={styles.categorySection}>
        <Text style={[styles.categoryTitle, { color: themeColors.textSecondary }]}>
          Custom Duration
        </Text>

        {isCustomDuration && renderDurationButton(selectedValue, true)}

        {!showCustomInput ? (
          <TouchableOpacity
            style={[
              styles.customButton,
              {
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.border,
              }
            ]}
            onPress={() => setShowCustomInput(true)}
          >
            <Icon name="plus" size={16} color={brandColors.primary} />
            <Text style={[styles.customButtonText, { color: themeColors.textPrimary }]}>
              Add Custom Duration
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.customInputContainer}>
            <View style={[
              styles.customInput,
              {
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.border,
              }
            ]}>
              <TextInput
                style={[styles.customInputText, { color: themeColors.textPrimary }]}
                value={customDuration}
                onChangeText={setCustomDuration}
                placeholder="Enter minutes"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="numeric"
                maxLength={3}
                autoFocus
                onSubmitEditing={handleCustomSubmit}
              />
              <TouchableOpacity
                style={[styles.customSubmitButton, { backgroundColor: brandColors.primary }]}
                onPress={handleCustomSubmit}
              >
                <Icon name="check" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.customCancelButton}
              onPress={() => {
                setShowCustomInput(false);
                setCustomDuration('');
              }}
            >
              <Text style={[styles.customCancelText, { color: themeColors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
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

  // Update currentDuration when selectedDuration changes
  useEffect(() => {
    setCurrentDuration(selectedDuration);
  }, [selectedDuration]);

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

  const handleModalOpen = () => {
    if (!disabled) {
      triggerHapticFeedback();
      setIsModalVisible(true);
    }
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

          {/* Duration Grid */}
          <View style={styles.pickerContainer}>
            <DurationGrid
              selectedValue={currentDuration}
              onValueChange={(duration) => {
                setCurrentDuration(duration);
                onDurationSelect(duration);
                setIsModalVisible(false);
              }}
              onClose={() => setIsModalVisible(false)}
              isDarkMode={isDarkMode}
              themeColors={themeColors}
              brandColors={brandColors}
            />
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
    paddingTop: 24,
    paddingBottom: 16,
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Duration Grid Styles
  durationContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationButton: {
    borderRadius: 12,
    borderWidth: 2,
    width: 80,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  durationButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  durationButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  durationButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 16,
  },
  customButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  customInputContainer: {
    gap: 12,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  customInputText: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  customSubmitButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCancelButton: {
    alignSelf: 'flex-start',
  },
  customCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DurationSelector;
