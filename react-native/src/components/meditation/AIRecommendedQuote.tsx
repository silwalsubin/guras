import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
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
      <View
        style={[
          styles.card,
          { backgroundColor: brandColors.primary + '12' },
        ]}
      >
        {/* Header with Badge and Refresh */}
        <View style={styles.header}>
          <View style={[styles.aiBadge, { backgroundColor: brandColors.primary + '25' }]}>
            <Icon name="magic" size={11} color={brandColors.primary} />
            <Text style={[styles.badgeText, { color: brandColors.primary }]}>
              AI Recommended
            </Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Icon name="refresh" size={14} color={brandColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quote Text - Main Focus */}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 16,
    overflow: 'hidden',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
  },
  badgeText: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '600',
    fontSize: 11,
  },
  refreshButton: {
    padding: 8,
  },
  quoteContainer: {
    marginBottom: 18,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
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

