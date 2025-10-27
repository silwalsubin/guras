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
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
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
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  titleText: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  reason: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  recommendedBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metadataText: {
    fontSize: 13,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  themeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ctaContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Compact styles
  compactContainer: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactThemeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  compactReason: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  compactDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 5,
  },
  compactDurationText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default RecommendationCard;

