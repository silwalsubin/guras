import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState, AppDispatch } from '@/store';
import {
  EmotionTriggerData,
  Trigger,
  mockEmotionTriggersData,
} from '@/data/mockEmotionTriggersData';
import { fetchEmotionStatistics } from '@/store/emotionStatisticsSlice';
import EmotionDonutChart from '@/components/home/EmotionDonutChart';

interface EmotionTriggersScreenProps {
  onClose: () => void;
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

const getEmotionColor = (emotion: string): string => {
  const colors: Record<string, string> = {
    Happy: '#10B981', // Primary green
    Anxious: '#F59E0B', // Warning amber
    Calm: '#3B82F6', // Info blue
    Sad: '#8B5CF6', // Purple
    Excited: '#EC4899', // Pink
    Angry: '#EF4444', // Error red
  };
  return colors[emotion] || '#10B981';
};

const EmotionTriggersScreen: React.FC<EmotionTriggersScreenProps> = ({
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const emotionStatistics = useSelector((state: RootState) => state.emotionStatistics.data);
  const emotionStatisticsLoading = useSelector((state: RootState) => state.emotionStatistics.isLoading);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedEmotions, setExpandedEmotions] = useState<Set<string>>(
    new Set()
  );

  // Fetch emotion statistics on mount
  useEffect(() => {
    dispatch(fetchEmotionStatistics());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchEmotionStatistics());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const toggleEmotionExpand = (emotion: string) => {
    const newExpanded = new Set(expandedEmotions);
    if (newExpanded.has(emotion)) {
      newExpanded.delete(emotion);
    } else {
      newExpanded.add(emotion);
    }
    setExpandedEmotions(newExpanded);
  };

  const renderEmotionCard = (emotionData: EmotionTriggerData, index: number) => {
    const isExpanded = expandedEmotions.has(emotionData.emotion);

    return (
      <View key={emotionData.emotion}>
        {/* Header - Always visible */}
        <TouchableOpacity
          onPress={() => toggleEmotionExpand(emotionData.emotion)}
          style={styles.emotionHeader}
          activeOpacity={0.7}
        >
          <View style={styles.emotionHeaderLeft}>
            <View
              style={[
                styles.emotionIconContainer,
                {
                  backgroundColor: isDarkMode
                    ? `${getEmotionColor(emotionData.emotion)}20`
                    : `${getEmotionColor(emotionData.emotion)}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getEmotionIcon(emotionData.emotion)}
                size={28}
                color={getEmotionColor(emotionData.emotion)}
              />
            </View>
            <View style={styles.emotionHeaderInfo}>
              <Text
                style={[
                  styles.emotionName,
                  { color: themeColors.textPrimary },
                ]}
              >
                {emotionData.emotion}
              </Text>
              <Text
                style={[
                  styles.emotionStats,
                  { color: themeColors.textSecondary },
                ]}
              >
                {emotionData.entryCount} {emotionData.entryCount === 1 ? 'entry' : 'entries'} • {emotionData.frequency}%
              </Text>
            </View>
          </View>
          <View style={styles.emotionHeaderRight}>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={brandColors.primary}
            />
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.triggersContainer}>
              <Text
                style={[
                  styles.triggersTitle,
                  { color: themeColors.textSecondary },
                ]}
              >
                Top Triggers
              </Text>
              <FlatList
                data={emotionData.triggers}
                renderItem={({ item }) => (
                  <TriggerItem
                    trigger={item}
                    isDarkMode={isDarkMode}
                    themeColors={themeColors}
                    brandColors={brandColors}
                    emotionColor={getEmotionColor(emotionData.emotion)}
                  />
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
          </View>
        )}
        <View
          style={[
            styles.horizontalDivider,
            {
              backgroundColor: isDarkMode
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.08)',
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
            borderBottomColor: isDarkMode
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={brandColors.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text
            style={[
              styles.title,
              { color: themeColors.textPrimary },
            ]}
          >
            Emotion Insights
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: themeColors.textSecondary },
            ]}
          >
            What triggers your emotions
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brandColors.primary}
          />
        }
      >
        {/* Donut Chart */}
        <View style={styles.chartSection}>
          <EmotionDonutChart
            emotions={
              emotionStatistics
                ? emotionStatistics.emotions.map((emotion) => ({
                    emotion: emotion.emotionName,
                    moodScore: 3,
                    emoji: '😊',
                    triggers: [],
                    entryCount: emotion.count,
                    frequency: Math.round(
                      (emotion.count / emotionStatistics.totalEntries) * 100
                    ),
                  }))
                : mockEmotionTriggersData.emotions
            }
            isDarkMode={isDarkMode}
          />
        </View>

        {/* Emotions List */}
        <View style={styles.emotionsListContainer}>
          {(emotionStatistics
            ? emotionStatistics.emotions.map((emotion) => ({
                emotion: emotion.emotionName,
                moodScore: 3,
                emoji: '😊',
                triggers: [],
                entryCount: emotion.count,
                frequency: Math.round(
                  (emotion.count / emotionStatistics.totalEntries) * 100
                ),
              }))
            : mockEmotionTriggersData.emotions
          ).map((emotion, index) =>
            renderEmotionCard(emotion, index)
          )}
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

interface TriggerItemProps {
  trigger: Trigger;
  isDarkMode: boolean;
  themeColors: any;
  brandColors: any;
  emotionColor: string;
}

const TriggerItem: React.FC<TriggerItemProps> = ({
  trigger,
  isDarkMode,
  themeColors,
  brandColors,
  emotionColor,
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
        styles.triggerItem,
        {
          backgroundColor: isDarkMode
            ? `${emotionColor}14`
            : `${emotionColor}0F`,
          borderColor: isDarkMode
            ? `${emotionColor}26`
            : `${emotionColor}1F`,
        },
      ]}
    >
      <View style={styles.triggerLeft}>
        <MaterialCommunityIcons
          name={getCategoryIcon(trigger.category)}
          size={20}
          color={emotionColor}
          style={styles.triggerItemIcon}
        />
        <View style={styles.triggerInfo}>
          <Text
            style={[
              styles.triggerItemText,
              { color: themeColors.textPrimary },
            ]}
          >
            {trigger.text}
          </Text>
          <Text
            style={[
              styles.triggerCategory,
              { color: themeColors.textSecondary },
            ]}
          >
            {trigger.category.replace('-', ' ')}
            {trigger.isManual && ' • Manual'}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.confidenceBadge,
          {
            backgroundColor: isDarkMode
              ? `${emotionColor}1F`
              : `${emotionColor}19`,
          },
        ]}
      >
        <Text
          style={[
            styles.confidenceValue,
            { color: emotionColor },
          ]}
        >
          {trigger.confidenceScore}%
        </Text>
      </View>
    </View>
  );
};

const getMoodColor = (score: number): string => {
  if (score <= 2) return '#FF6B6B'; // Red for sad
  if (score === 3) return '#FFD93D'; // Yellow for neutral
  return '#6BCB77'; // Green for happy
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    ...TYPOGRAPHY.BODY_BOLD,
    fontSize: 18,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  chartSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emotionsListContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  emotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emotionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emotionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emotionHeaderInfo: {
    flex: 1,
  },
  emotionName: {
    ...TYPOGRAPHY.BODY_BOLD,
    fontSize: 17,
  },
  emotionStats: {
    fontSize: 12,
    marginTop: 3,
  },
  emotionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  moodScoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  horizontalDivider: {
    height: 1,
    marginHorizontal: 0,
  },
  triggersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  triggersTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerItemIcon: {
    marginRight: 12,
  },
  triggerInfo: {
    flex: 1,
  },
  triggerItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  triggerCategory: {
    fontSize: 12,
    marginTop: 3,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 80,
  },
});

export default EmotionTriggersScreen;

