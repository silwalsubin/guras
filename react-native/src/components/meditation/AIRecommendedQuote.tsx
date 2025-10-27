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
import { BaseCard } from '@/components/shared';
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
      <BaseCard style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Finding your perfect quote...
          </Text>
        </View>
      </BaseCard>
    );
  }

  if (error || !quote) {
    return (
      <BaseCard style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
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
      </BaseCard>
    );
  }

  return (
    <BaseCard style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
      {/* AI Badge */}
      <View style={styles.badgeContainer}>
        <View style={[styles.aiBadge, { backgroundColor: brandColors.primary + '20' }]}>
          <Icon name="magic" size={12} color={brandColors.primary} />
          <Text style={[styles.badgeText, { color: brandColors.primary }]}>
            AI Recommended
          </Text>
        </View>
        <TouchableOpacity onPress={handleRefresh}>
          <Icon name="refresh" size={16} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Quote Text */}
      <View style={styles.quoteContainer}>
        <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
          "{quote.text}"
        </Text>
      </View>

      {/* Author */}
      <View style={styles.authorContainer}>
        <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
          — {quote.author}
        </Text>
      </View>

      {/* Reason */}
      <View style={styles.reasonContainer}>
        <Icon name="lightbulb-o" size={14} color={brandColors.primary} />
        <Text style={[styles.reasonText, { color: themeColors.textSecondary }]}>
          {quote.reason}
        </Text>
      </View>

      {/* Category Badge */}
      <View style={styles.categoryContainer}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: brandColors.primary + '15' },
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
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY_SMALL,
    marginTop: 12,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '600',
  },
  quoteContainer: {
    marginBottom: 16,
  },
  quoteText: {
    ...TYPOGRAPHY.QUOTE,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  authorContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  authorText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '500',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  reasonText: {
    ...TYPOGRAPHY.CAPTION,
    flex: 1,
  },
  categoryContainer: {
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default AIRecommendedQuote;

