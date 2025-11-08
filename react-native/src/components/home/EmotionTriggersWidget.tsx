import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';
import { EmotionTriggerData, Trigger } from '@/data/mockEmotionTriggersData';
import EmotionDonutChart from './EmotionDonutChart';

interface EmotionTriggersWidgetProps {
  topEmotion: EmotionTriggerData | null;
  allEmotions: EmotionTriggerData[];
  onPress: () => void;
  totalEntries: number;
}

const getEmotionIcon = (emotion: string): string => {
  const icons: Record<string, string> = {
    Happy: 'arrow-up-circle-outline',
    Anxious: 'pulse',
    Calm: 'leaf',
    Sad: 'arrow-down-circle-outline',
    Excited: 'lightning-bolt',
    Angry: 'fire',
  };
  return icons[emotion] || 'heart-outline';
};

const EmotionTriggersWidget: React.FC<EmotionTriggersWidgetProps> = ({
  topEmotion,
  allEmotions,
  onPress,
  totalEntries,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  // Get top 3 triggers
  const topTriggers = useMemo(() => {
    if (!topEmotion) return [];
    return topEmotion.triggers.slice(0, 3);
  }, [topEmotion]);

  // Empty state
  if (!topEmotion || totalEntries === 0) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
            borderColor: isDarkMode
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <View style={styles.emptyStateContent}>
          <MaterialCommunityIcons
            name="chart-box-outline"
            size={32}
            color={brandColors.primary}
            style={styles.emptyIcon}
          />
          <Text
            style={[
              styles.emptyTitle,
              { color: themeColors.textPrimary },
            ]}
          >
            Emotion Insights
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: themeColors.textSecondary },
            ]}
          >
            Start journaling to discover what triggers your emotions
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.wrapper}
    >
      {/* Separator line */}
      <View
        style={[
          styles.separator,
          {
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.08)',
          },
        ]}
      />

      {/* Donut Chart - No card styling */}
      <EmotionDonutChart emotions={allEmotions} isDarkMode={isDarkMode} />

      {/* Footer with stats - positioned at bottom right */}
      <View style={styles.statsContainer}>
        <Text
          style={[
            styles.statsText,
            { color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' },
          ]}
        >
          Based on {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      {/* Separator line after stats */}
      <View
        style={[
          styles.separatorBottom,
          {
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.08)',
          },
        ]}
      />
    </TouchableOpacity>
  );
};

interface TriggerBadgeProps {
  trigger: Trigger;
  isDarkMode: boolean;
  themeColors: any;
  brandColors: any;
}

const TriggerBadge: React.FC<TriggerBadgeProps> = ({
  trigger,
  isDarkMode,
  themeColors,
  brandColors,
}) => {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      people: 'account-multiple',
      activities: 'run-fast',
      locations: 'map-marker-radius',
      topics: 'lightbulb-outline',
      'time-patterns': 'clock-outline',
      'external-factors': 'weather-cloudy',
    };
    return icons[category] || 'tag-outline';
  };

  return (
    <View
      style={[
        styles.triggerBadge,
        {
          backgroundColor: isDarkMode
            ? 'rgba(16, 185, 129, 0.08)'
            : 'rgba(16, 185, 129, 0.06)',
          borderColor: isDarkMode
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(16, 185, 129, 0.12)',
        },
      ]}
    >
      <View style={styles.triggerContent}>
        <MaterialCommunityIcons
          name={getCategoryIcon(trigger.category)}
          size={16}
          color={brandColors.primary}
          style={styles.triggerIcon}
        />
        <Text
          style={[
            styles.triggerText,
            { color: themeColors.textPrimary },
          ]}
          numberOfLines={1}
        >
          {trigger.text}
        </Text>
      </View>
      <View
        style={[
          styles.confidenceBadge,
          {
            backgroundColor: isDarkMode
              ? 'rgba(16, 185, 129, 0.12)'
              : 'rgba(16, 185, 129, 0.1)',
          },
        ]}
      >
        <Text
          style={[
            styles.confidenceText,
            { color: brandColors.primary },
          ]}
        >
          {trigger.confidenceScore}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  separator: {
    height: 1,
    marginBottom: 12,
  },
  separatorBottom: {
    height: 1,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emotionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emotionTextContainer: {
    flex: 1,
  },
  emotionLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  emotionName: {
    ...TYPOGRAPHY.BODY_BOLD,
    fontSize: 17,
  },
  frequencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  triggersSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  triggersLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  triggersList: {
    gap: 8,
  },
  triggerBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerIcon: {
    marginRight: 10,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  confidenceBadge: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  statsText: {
    fontSize: 10,
    fontWeight: '400',
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    ...TYPOGRAPHY.BODY_BOLD,
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default EmotionTriggersWidget;

