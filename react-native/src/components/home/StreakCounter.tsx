import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface StreakCounterProps {
  currentStreak?: number;
  longestStreak?: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ 
  currentStreak = 0, 
  longestStreak = 0 
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const [fireScale] = useState(new Animated.Value(1));

  // Animate fire icon on mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fireScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fireScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStreak, fireScale]);

  const streakStatus = currentStreak > 0 ? 'active' : 'inactive';
  const streakColor = currentStreak > 0 ? '#FF6B6B' : themeColors.textSecondary;

  return (
    <View style={styles.container}>
      {/* Current Streak */}
      <View style={[
        styles.streakCard,
        {
          backgroundColor: isDarkMode
            ? 'rgba(255, 107, 107, 0.08)'
            : 'rgba(255, 107, 107, 0.06)',
          borderColor: isDarkMode
            ? 'rgba(255, 107, 107, 0.2)'
            : 'rgba(255, 107, 107, 0.15)',
        }
      ]}>
        <View style={styles.streakContent}>
          <View style={styles.streakLeft}>
            <Animated.Text 
              style={[
                styles.fireEmoji,
                { transform: [{ scale: fireScale }] }
              ]}
            >
              🔥
            </Animated.Text>
            <View style={styles.streakTextContainer}>
              <Text style={[styles.streakLabel, { color: themeColors.textSecondary }]}>
                Current Streak
              </Text>
              <Text style={[styles.streakNumber, { color: streakColor }]}>
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </View>
          
          {/* Best Streak Badge */}
          <View style={[
            styles.bestStreakBadge,
            { backgroundColor: brandColors.primary + '20' }
          ]}>
            <FontAwesome 
              name="trophy" 
              size={12} 
              color={brandColors.primary}
              style={styles.trophyIcon}
            />
            <Text style={[styles.bestStreakText, { color: brandColors.primary }]}>
              Best: {longestStreak}
            </Text>
          </View>
        </View>

        {/* Motivational Message */}
        {currentStreak > 0 && (
          <Text style={[styles.motivationalText, { color: themeColors.textSecondary }]}>
            {currentStreak === 1 && "Great start! Keep it going 💪"}
            {currentStreak >= 2 && currentStreak < 7 && "You're building momentum! 🚀"}
            {currentStreak >= 7 && currentStreak < 30 && "Amazing consistency! 🌟"}
            {currentStreak >= 30 && "You're a meditation master! 👑"}
          </Text>
        )}
        
        {currentStreak === 0 && (
          <Text style={[styles.motivationalText, { color: themeColors.textSecondary }]}>
            Start meditating today to build your streak 🌱
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  streakCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fireEmoji: {
    fontSize: 32,
  },
  streakTextContainer: {
    gap: 2,
  },
  streakLabel: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '500',
  },
  streakNumber: {
    ...TYPOGRAPHY.HEADING_4,
    fontWeight: '700',
  },
  bestStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  trophyIcon: {
    marginRight: 2,
  },
  bestStreakText: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '600',
  },
  motivationalText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '400',
    fontStyle: 'italic',
  },
});

export default StreakCounter;

