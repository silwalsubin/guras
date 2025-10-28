import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface DailyGoalProgressProps {
  todayMinutes?: number;
  dailyGoal?: number;
  onStartMeditation?: () => void;
}

const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({
  todayMinutes = 0,
  dailyGoal = 10,
  onStartMeditation,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const progress = Math.min((todayMinutes / dailyGoal) * 100, 100);
  const isGoalMet = todayMinutes >= dailyGoal;
  const remainingMinutes = Math.max(dailyGoal - todayMinutes, 0);

  const motivationalMessage = useMemo(() => {
    if (isGoalMet) {
      return '🎉 Goal achieved! Great job today!';
    }
    if (todayMinutes === 0) {
      return `Start your day with ${dailyGoal} minutes of meditation`;
    }
    if (remainingMinutes <= 2) {
      return `Almost there! Just ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} left`;
    }
    return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} to go`;
  }, [todayMinutes, dailyGoal, remainingMinutes, isGoalMet]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? 'rgba(16, 185, 129, 0.08)'
            : 'rgba(16, 185, 129, 0.06)',
          borderColor: isDarkMode
            ? 'rgba(16, 185, 129, 0.2)'
            : 'rgba(16, 185, 129, 0.15)',
        }
      ]}
      onPress={onStartMeditation}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FontAwesome 
            name="target" 
            size={16} 
            color={brandColors.primary}
            style={styles.targetIcon}
          />
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>
            Today's Goal
          </Text>
        </View>
        
        {isGoalMet && (
          <View style={[styles.completeBadge, { backgroundColor: '#10B981' }]}>
            <FontAwesome name="check" size={12} color="white" />
          </View>
        )}
      </View>

      {/* Progress Display */}
      <View style={styles.progressDisplay}>
        <Text style={[styles.progressNumber, { color: brandColors.primary }]}>
          {todayMinutes}
        </Text>
        <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
          / {dailyGoal} min
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[
        styles.progressBar,
        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
      ]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor: isGoalMet ? '#10B981' : brandColors.primary,
            }
          ]}
        />
      </View>

      {/* Motivational Message */}
      <Text style={[styles.motivationalText, { color: themeColors.textSecondary }]}>
        {motivationalMessage}
      </Text>

      {/* CTA Button */}
      {!isGoalMet && (
        <View style={[
          styles.ctaButton,
          { backgroundColor: brandColors.primary + '15' }
        ]}>
          <FontAwesome 
            name="play" 
            size={12} 
            color={brandColors.primary}
            style={styles.playIcon}
          />
          <Text style={[styles.ctaText, { color: brandColors.primary }]}>
            Start Meditation
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetIcon: {
    marginRight: 2,
  },
  title: {
    ...TYPOGRAPHY.HEADING_4,
    fontWeight: '700',
  },
  completeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  progressNumber: {
    ...TYPOGRAPHY.HEADING_2,
    fontWeight: '700',
  },
  progressLabel: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  motivationalText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  playIcon: {
    marginRight: 2,
  },
  ctaText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '600',
  },
});

export default DailyGoalProgress;

