import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
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
      {/* Selection highlight background - full screen width */}
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
              {item} min
            </Text>
          </View>
        ))}
      </ScrollView>
      <Text
        style={[styles.wheelLabel, { color: themeColors.textPrimary }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
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

  const handleDurationConfirm = () => {
    onDurationSelect(currentDuration);
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.border,
            opacity: disabled ? 0.6 : 1,
          }
        ]}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
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

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
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
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: brandColors.primary }]}
              onPress={handleDurationConfirm}
            >
              <Text style={styles.confirmButtonText}>Select Duration</Text>
            </TouchableOpacity>
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
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
