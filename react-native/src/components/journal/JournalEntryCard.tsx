import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors } from '@/config/colors';
import { JournalEntry } from '@/types/journal';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onPress }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  const scrollAnim = useRef(new Animated.Value(0)).current;
  const titleWidth = useRef(0);
  const containerWidth = useRef(0);
  const animationStarted = useRef(false);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getMoodColor = (mood?: string) => {
    const moodColorMap: { [key: string]: string } = {
      'very poor': '#FF6B6B',
      'poor': '#FF8C42',
      'fair': '#FFD93D',
      'good': '#6BCB77',
      'very good': '#4D96FF',
    };
    return moodColorMap[mood?.toLowerCase() || ''] || '#999999';
  };





  const startScrollAnimation = () => {
    if (animationStarted.current || titleWidth.current <= containerWidth.current) {
      return;
    }

    animationStarted.current = true;
    const scrollDistance = titleWidth.current - containerWidth.current + 20;
    const duration = scrollDistance * 30;

    Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(scrollAnim, {
          toValue: -scrollDistance,
          duration,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(scrollAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startScrollAnimation();
  }, []);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: themeColors.cardBackground }]}
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(entry.mood) }]} />
          <View style={{ flex: 1 }}>
            <View
              style={styles.titleWrapper}
              onLayout={(e) => {
                containerWidth.current = e.nativeEvent.layout.width;
                startScrollAnimation();
              }}
            >
              <Animated.Text
                style={[
                  styles.title,
                  { color: themeColors.textPrimary },
                  { transform: [{ translateX: scrollAnim }] },
                ]}
                onLayout={(e) => {
                  titleWidth.current = e.nativeEvent.layout.width;
                }}
                numberOfLines={1}
              >
                {entry.title}
              </Animated.Text>
            </View>
            <Text style={[styles.moodLabel, { color: themeColors.textSecondary }]}>
              {entry.mood || 'Analyzing mood...'}
            </Text>
          </View>
        </View>
        <Text style={[styles.date, { color: themeColors.textSecondary }]}>
          {formatDate(entry.createdAt)}
        </Text>
      </View>

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.slice(0, 2).map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, { backgroundColor: themeColors.border }]}
            >
              <Text style={[styles.tagText, { color: themeColors.textSecondary }]}>
                #{tag}
              </Text>
            </View>
          ))}
          {entry.tags.length > 2 && (
            <Text style={[styles.moreTagsText, { color: themeColors.textSecondary }]}>
              +{entry.tags.length - 2}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    alignItems: 'flex-start',
    marginRight: 12,
    gap: 10,
  },
  moodIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  titleWrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    flexWrap: 'nowrap',
  },
  moodLabel: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default JournalEntryCard;

