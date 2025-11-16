import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getThemeColors } from '@/config/colors';
import { DATE_RANGE_OPTIONS, DateRangeOption } from '@/constants/dateRanges';

interface DateRangeSelectorProps {
  selectedOption: DateRangeOption;
  onSelect: (option: DateRangeOption) => void;
  isDarkMode: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedOption,
  onSelect,
  isDarkMode,
}) => {
  const themeColors = getThemeColors(isDarkMode);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: themeColors.textSecondary },
        ]}
      >
        Your emotional state
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {DATE_RANGE_OPTIONS.map((option) => {
          const isSelected = option.id === selectedOption.id;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onSelect(option)}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected
                    ? '#10B981'
                    : isDarkMode
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                  borderColor: isSelected ? '#10B981' : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected
                      ? '#fff'
                      : themeColors.textPrimary,
                    fontWeight: isSelected ? '600' : '500',
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
  },
});

export default DateRangeSelector;

