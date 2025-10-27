import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';

interface MoodSelectorProps {
  selectedScore: number | undefined;
  onMoodSelect: (score: number, mood: string) => void;
}

const MOOD_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Very Good',
};

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedScore, onMoodSelect }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const currentScore = selectedScore || 3;
  const currentLabel = MOOD_LABELS[currentScore as keyof typeof MOOD_LABELS] || 'Fair';

  const handleSliderChange = (value: number) => {
    const roundedValue = Math.round(value);
    const label = MOOD_LABELS[roundedValue as keyof typeof MOOD_LABELS];
    onMoodSelect(roundedValue, label.toLowerCase());
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>
          How are you feeling?
        </Text>
        <Text style={[styles.moodValue, { color: brandColors.primary }]}>
          {currentScore}/5
        </Text>
      </View>

      <Text style={[styles.moodLabel, { color: themeColors.textSecondary }]}>
        {currentLabel}
      </Text>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={currentScore}
          onValueChange={handleSliderChange}
          minimumTrackTintColor={brandColors.primary}
          maximumTrackTintColor={themeColors.border}
          thumbTintColor={brandColors.primary}
        />
      </View>

      <View style={styles.scaleLabels}>
        <Text style={[styles.scaleLabel, { color: themeColors.textSecondary }]}>
          Poor
        </Text>
        <Text style={[styles.scaleLabel, { color: themeColors.textSecondary }]}>
          Excellent
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  moodValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  moodLabel: {
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500',
  },
  sliderContainer: {
    justifyContent: 'center',
    height: 50,
    marginVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  scaleLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default MoodSelector;

