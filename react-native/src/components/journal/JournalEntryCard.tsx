import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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



  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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







  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: themeColors.cardBackground }]}
        onPress={() => onPress(entry)}
        activeOpacity={0.7}
      >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.title, { color: themeColors.textPrimary }]}
              numberOfLines={0}
            >
              {entry.title}
            </Text>
            {entry.mood && (
              <View
                style={[
                  styles.moodBadge,
                  { backgroundColor: getMoodColor(entry.mood) },
                ]}
              >
                <Text style={styles.moodBadgeText}>
                  {entry.mood}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.date, { color: themeColors.textSecondary }]}>
          {formatTime(entry.createdAt)}
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
      <View style={[styles.separator, { backgroundColor: themeColors.border }]} />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 0,
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  moodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  moodBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 4,
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

