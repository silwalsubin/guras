import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { RootState } from '@/store';

interface Achievement {
  id: number;
  name: string;
  description: string;
  earned: boolean;
  icon: string;
  progress?: number;
  target?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  onPress,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const progressPercentage = achievement.progress && achievement.target 
    ? (achievement.progress / achievement.target) * 100 
    : 0;

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        {
          backgroundColor: achievement.earned
            ? brandColors.primary + '20'
            : themeColors.card,
          borderColor: achievement.earned
            ? brandColors.primary
            : themeColors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[
        styles.iconContainer,
        {
          backgroundColor: achievement.earned 
            ? brandColors.primary 
            : themeColors.border,
        },
      ]}>
        <Icon
          name={achievement.icon}
          size={20}
          color={achievement.earned ? '#FFFFFF' : themeColors.textSecondary}
        />
      </View>

      <View style={styles.content}>
        <Text style={[
          styles.name,
          {
            color: achievement.earned 
              ? themeColors.textPrimary 
              : themeColors.textSecondary,
            fontWeight: achievement.earned ? '600' : '500',
          },
        ]}>
          {achievement.name}
        </Text>
        
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          {achievement.description}
        </Text>

        {!achievement.earned && achievement.progress && achievement.target && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: brandColors.primary,
                    width: `${Math.min(progressPercentage, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
              {achievement.progress}/{achievement.target}
            </Text>
          </View>
        )}
      </View>

      {achievement.earned && (
        <View style={styles.earnedBadge}>
          <Icon name="check" size={12} color="#FFFFFF" />
        </View>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
  earnedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default AchievementBadge;
