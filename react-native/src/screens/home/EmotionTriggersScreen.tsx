import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';
import {
  EmotionTriggerData,
  Trigger,
  mockEmotionTriggersData,
} from '@/data/mockEmotionTriggersData';

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

const EmotionTriggersScreen: React.FC<EmotionTriggersScreenProps> = ({
  onClose,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedEmotions, setExpandedEmotions] = useState<Set<string>>(
    new Set([mockEmotionTriggersData.emotions[0]?.emotion])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const toggleEmotionExpand = (emotion: string) => {
    const newExpanded = new Set(expandedEmotions);
    if (newExpanded.has(emotion)) {
      newExpanded.delete(emotion);
    } else {
      newExpanded.add(emotion);
    }
    setExpandedEmotions(newExpanded);
  };

  const renderEmotionCard = (emotionData: EmotionTriggerData) => {
    const isExpanded = expandedEmotions.has(emotionData.emotion);

    return (
      <View
        key={emotionData.emotion}
        style={[
          styles.emotionCard,
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
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(16, 185, 129, 0.1)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getEmotionIcon(emotionData.emotion)}
                size={28}
                color={brandColors.primary}
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
            <View
              style={[
                styles.moodScoreBadge,
                { backgroundColor: getMoodColor(emotionData.moodScore) },
              ]}
            >
              <Text style={styles.moodScoreText}>
                {emotionData.moodScore}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={brandColors.primary}
            />
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <>
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDarkMode
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.08)',
                },
              ]}
            />
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
                  />
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          </>
        )}
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
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
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
            <Text
              style={[
                styles.statValue,
                { color: brandColors.primary },
              ]}
            >
              {mockEmotionTriggersData.totalEntries}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: themeColors.textSecondary },
              ]}
            >
              Total Entries
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
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
            <Text
              style={[
                styles.statValue,
                { color: brandColors.primary },
              ]}
            >
              {mockEmotionTriggersData.emotions.length}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: themeColors.textSecondary },
              ]}
            >
              Emotions
            </Text>
          </View>
        </View>

        {/* Emotions List */}
        <View style={styles.emotionsListContainer}>
          {mockEmotionTriggersData.emotions.map((emotion) =>
            renderEmotionCard(emotion)
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
}

const TriggerItem: React.FC<TriggerItemProps> = ({
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
        styles.triggerItem,
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
      <View style={styles.triggerLeft}>
        <MaterialCommunityIcons
          name={getCategoryIcon(trigger.category)}
          size={20}
          color={brandColors.primary}
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
              ? 'rgba(16, 185, 129, 0.12)'
              : 'rgba(16, 185, 129, 0.1)',
          },
        ]}
      >
        <Text
          style={[
            styles.confidenceValue,
            { color: brandColors.primary },
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.BODY_BOLD,
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  emotionsListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  emotionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  divider: {
    height: 1,
    marginHorizontal: 16,
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
    height: 24,
  },
});

export default EmotionTriggersScreen;

