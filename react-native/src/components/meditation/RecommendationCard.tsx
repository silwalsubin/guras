import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

export interface MeditationRecommendation {
  title: string;
  theme: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  reason: string;
}

interface RecommendationCardProps {
  recommendation: MeditationRecommendation;
  onPress: (recommendation: MeditationRecommendation) => void;
  style?: any;
  compact?: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onPress,
  style,
  compact = false,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const getThemeIcon = (theme: string): string => {
    switch (theme.toLowerCase()) {
      case 'mindfulness': return 'leaf';
      case 'stress-relief': return 'heart';
      case 'sleep': return 'moon-o';
      case 'focus': return 'eye';
      case 'anxiety': return 'shield';
      case 'gratitude': return 'smile-o';
      case 'compassion': return 'heart-o';
      case 'body-scan': return 'user-o';
      default: return 'circle';
    }
  };

  const getThemeColor = (theme: string): string => {
    switch (theme.toLowerCase()) {
      case 'mindfulness': return '#10B981';
      case 'stress-relief': return '#EF4444';
      case 'sleep': return '#6366F1';
      case 'focus': return '#F59E0B';
      case 'anxiety': return '#8B5CF6';
      case 'gratitude': return '#EC4899';
      case 'compassion': return '#F97316';
      default: return brandColors.primary;
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return brandColors.primary;
    }
  };

  const themeColor = getThemeColor(recommendation.theme);
  const difficultyColor = getDifficultyColor(recommendation.difficulty);

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { backgroundColor: themeColors.card },
          style,
        ]}
        onPress={() => onPress(recommendation)}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          {/* Theme Icon */}
          <View
            style={[
              styles.compactThemeIcon,
              { backgroundColor: themeColor + '20' },
            ]}
          >
            <Icon name={getThemeIcon(recommendation.theme)} size={14} color={themeColor} />
          </View>

          {/* Info */}
          <View style={styles.compactInfo}>
            <Text
              style={[styles.compactTitle, { color: themeColors.textPrimary }]}
              numberOfLines={1}
            >
              {recommendation.title}
            </Text>
            <Text
              style={[styles.compactReason, { color: themeColors.textSecondary }]}
              numberOfLines={1}
            >
              {recommendation.reason}
            </Text>
          </View>

          {/* Duration Badge */}
          <View
            style={[
              styles.compactDurationBadge,
              { backgroundColor: brandColors.primary + '20' },
            ]}
          >
            <Icon name="clock-o" size={10} color={brandColors.primary} />
            <Text
              style={[
                styles.compactDurationText,
                { color: brandColors.primary },
              ]}
            >
              {recommendation.duration}m
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: themeColors.card },
        style,
      ]}
      onPress={() => onPress(recommendation)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {/* Theme Icon */}
          <View
            style={[
              styles.themeIcon,
              { backgroundColor: themeColor + '20' },
            ]}
          >
            <Icon name={getThemeIcon(recommendation.theme)} size={16} color={themeColor} />
          </View>

          {/* Title and Reason */}
          <View style={styles.titleText}>
            <Text
              style={[styles.title, { color: themeColors.textPrimary }]}
              numberOfLines={2}
            >
              {recommendation.title}
            </Text>
            <Text
              style={[styles.reason, { color: themeColors.textSecondary }]}
              numberOfLines={2}
            >
              {recommendation.reason}
            </Text>
          </View>
        </View>

        {/* Recommended Badge */}
        <View
          style={[
            styles.recommendedBadge,
            { backgroundColor: brandColors.primary + '20' },
          ]}
        >
          <Icon name="star" size={12} color={brandColors.primary} />
        </View>
      </View>

      {/* Metadata Row */}
      <View style={styles.metadataRow}>
        {/* Duration */}
        <View style={styles.metadataItem}>
          <Icon name="clock-o" size={12} color={themeColors.textSecondary} />
          <Text
            style={[styles.metadataText, { color: themeColors.textSecondary }]}
          >
            {recommendation.duration} min
          </Text>
        </View>

        {/* Difficulty */}
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: difficultyColor + '20' },
          ]}
        >
          <Text
            style={[
              styles.difficultyText,
              { color: difficultyColor },
            ]}
          >
            {recommendation.difficulty.charAt(0).toUpperCase() +
              recommendation.difficulty.slice(1)}
          </Text>
        </View>

        {/* Theme */}
        <View style={styles.themeBadge}>
          <Text
            style={[styles.themeText, { color: themeColor }]}
          >
            {recommendation.theme}
          </Text>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <Text style={[styles.ctaText, { color: brandColors.primary }]}>
          Start Session →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 12,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reason: {
    fontSize: 12,
    fontWeight: '400',
  },
  recommendedBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  themeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  themeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  ctaContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactThemeIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactReason: {
    fontSize: 11,
    fontWeight: '400',
  },
  compactDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  compactDurationText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default RecommendationCard;

