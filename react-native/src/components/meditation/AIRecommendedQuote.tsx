import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import Icon from 'react-native-vector-icons/FontAwesome';
import { apiService } from '@/services/api';

interface AIRecommendedQuoteProps {
  onRefresh?: () => void;
}

interface AIQuote {
  text: string;
  author: string;
  category: string;
  reason: string;
  isAIRecommended: boolean;
}

const AIRecommendedQuote: React.FC<AIRecommendedQuoteProps> = ({ onRefresh }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [quote, setQuote] = useState<AIQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeAction, setSwipeAction] = useState<'like' | 'dislike' | null>(null);

  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        const swipeThreshold = 50;

        if (gestureState.dx > swipeThreshold) {
          // Swiped right - Like
          Animated.timing(pan.x, {
            toValue: 500,
            duration: 300,
            useNativeDriver: false,
          }).start();
          handleLike();
        } else if (gestureState.dx < -swipeThreshold) {
          // Swiped left - Dislike
          Animated.timing(pan.x, {
            toValue: -500,
            duration: 300,
            useNativeDriver: false,
          }).start();
          handleDislike();
        } else {
          // Reset animation
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    fetchAIQuote();
  }, []);

  const fetchAIQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAIRecommendedQuote();

      if (response.success && response.data) {
        setQuote(response.data);
      } else {
        setError(response.error?.message || 'Failed to load AI-recommended quote');
      }
    } catch (err) {
      console.error('Error fetching AI-recommended quote:', err);
      setError('Failed to load AI-recommended quote');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAIQuote();
    onRefresh?.();
  };

  const handleLike = async () => {
    setSwipeAction('like');
    // Log the liked quote for analytics/recommendations
    if (quote) {
      console.log('📌 Liked quote:', quote.text);
      // TODO: Send to backend to track liked quotes for better recommendations
    }
    // Fetch next quote after a short delay
    setTimeout(async () => {
      await fetchAIQuote();
      setSwipeAction(null);
      pan.setValue({ x: 0, y: 0 });
    }, 600);
  };

  const handleDislike = async () => {
    setSwipeAction('dislike');
    // Log the disliked quote for analytics/recommendations
    if (quote) {
      console.log('👎 Disliked quote:', quote.text);
      // TODO: Send to backend to track disliked quotes to avoid similar content
    }
    // Fetch next quote after a short delay
    setTimeout(async () => {
      await fetchAIQuote();
      setSwipeAction(null);
      pan.setValue({ x: 0, y: 0 });
    }, 600);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.card,
            { backgroundColor: brandColors.primary + '12' },
          ]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={brandColors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
              Finding your perfect quote...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !quote) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.card,
            { backgroundColor: brandColors.primary + '12' },
          ]}
        >
          <View style={styles.errorContainer}>
            <Icon name="exclamation-circle" size={32} color={brandColors.primary} />
            <Text style={[styles.errorText, { color: themeColors.textPrimary }]}>
              {error || 'Unable to load quote'}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: brandColors.primary }]}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: brandColors.primary + '12' },
          {
            transform: [{ translateX: pan.x }],
            opacity: Animated.add(1, Animated.multiply(Animated.divide(pan.x, 500), -0.3)),
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Swipe Indicators */}
        {swipeAction && (
          <View style={styles.swipeIndicatorContainer}>
            {swipeAction === 'like' ? (
              <View style={[styles.swipeIndicator, styles.likeIndicator]}>
                <Icon name="heart" size={32} color="#10B981" />
                <Text style={styles.swipeText}>Liked!</Text>
              </View>
            ) : (
              <View style={[styles.swipeIndicator, styles.dislikeIndicator]}>
                <Icon name="times" size={32} color="#EF4444" />
                <Text style={styles.swipeText}>Skip</Text>
              </View>
            )}
          </View>
        )}

        {/* Quote Text - Main Focus */}
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton} activeOpacity={0.7}>
          <View style={styles.quoteContainer}>
          <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
            "{quote.text}"
          </Text>
        </View>

        {/* Author */}
        <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
          — {quote.author}
        </Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: brandColors.primary + '20' }]} />

        {/* Reason with Icon */}
        <View style={styles.reasonContainer}>
          <Icon name="lightbulb-o" size={13} color={brandColors.primary} />
          <Text style={[styles.reasonText, { color: themeColors.textSecondary }]}>
            {quote.reason}
          </Text>
        </View>

        {/* Category Badge */}
        <View style={styles.categoryContainer}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: brandColors.primary + '20' },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: brandColors.primary },
              ]}
            >
              {quote.category.replace('-', ' ')}
            </Text>
          </View>
        </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 16,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY_SMALL,
    marginTop: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '600',
  },
  refreshButton: {
    flex: 1,
  },
  swipeIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  swipeIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  likeIndicator: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 30,
  },
  dislikeIndicator: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 30,
  },
  swipeText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    color: '#10B981',
  },
  quoteContainer: {
    marginBottom: 18,
  },
  quoteText: {
    fontSize: 20,
    lineHeight: 32,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  authorText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 18,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  reasonText: {
    ...TYPOGRAPHY.CAPTION,
    flex: 1,
    lineHeight: 18,
  },
  categoryContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  categoryText: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'capitalize',
  },
});

export default AIRecommendedQuote;

