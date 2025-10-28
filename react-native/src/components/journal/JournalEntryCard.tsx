import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { JournalEntry } from '@/types/journal';
import { deleteJournalEntry } from '@/store/journalSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onPress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const pan = useRef(new Animated.ValueXY()).current;
  const [isDeleting, setIsDeleting] = React.useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow swiping left (negative dx)
        if (gestureState.dx < 0) {
          pan.x.setValue(Math.max(gestureState.dx, -100));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped more than 50 pixels left, show delete button
        if (gestureState.dx < -50) {
          Animated.spring(pan, {
            toValue: { x: -100, y: 0 },
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = async () => {
    console.log('🗑️ Delete button pressed for entry:', entry.id);
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            console.log('🗑️ Confirming delete for entry:', entry.id);
            setIsDeleting(true);
            try {
              await dispatch(deleteJournalEntry(entry.id)).unwrap();
              console.log('✅ Entry deleted successfully');
              // Reset swipe position
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
              }).start();
            } catch (error) {
              console.error('❌ Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
            } finally {
              setIsDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };



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
      <View style={styles.swipeContainer}>
        {/* Delete button - only visible when swiped */}
        <Animated.View
          style={[
            styles.deleteButtonContainer,
            {
              opacity: pan.x.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.8}
          >
            <FontAwesome name="trash" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Card with swipe animation */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              transform: [{ translateX: pan.x }],
            },
          ]}
          {...panResponder.panHandlers}
        >
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
        </Animated.View>
      </View>
      <View style={[styles.separator, { backgroundColor: themeColors.border }]} />
    </>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    borderRadius: 12,
  },
  card: {
    borderRadius: 12,
    padding: 12,
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

