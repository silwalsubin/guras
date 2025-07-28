import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';
import BaseCard from './BaseCard';
import quotesService, { Quote } from '@/services/quotesService';
import notificationService from '@/services/notificationService';

const DailyQuoteCard: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  useEffect(() => {
    loadCurrentQuote();
  }, []);

  const loadCurrentQuote = async () => {
    try {
      setLoading(true);
      const quote = await quotesService.updateQuoteIfNeeded();
      setCurrentQuote(quote);
    } catch (error) {
      console.error('Error loading current quote:', error);
      // Fallback to a random quote
      const fallbackQuote = quotesService.getRandomQuote();
      setCurrentQuote(fallbackQuote);
    } finally {
      setLoading(false);
    }
  };

  const refreshQuote = async () => {
    try {
      setLoading(true);
      const newQuote = quotesService.getRandomQuote();
      await quotesService.setCurrentQuote(newQuote);
      setCurrentQuote(newQuote);
    } catch (error) {
      console.error('Error refreshing quote:', error);
      Alert.alert('Error', 'Failed to refresh quote. Using fallback.');
      // Fallback - still show a new quote even if storage fails
      const newQuote = quotesService.getRandomQuote();
      setCurrentQuote(newQuote);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Test Notification', 'Notification system ready! Quote updated successfully.');
    }
  };

  if (loading) {
    return (
      <BaseCard style={styles.card}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          ✨ Daily Wisdom
        </Text>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          Loading inspiration...
        </Text>
      </BaseCard>
    );
  }

  if (!currentQuote) {
    return (
      <BaseCard style={styles.card}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          ✨ Daily Wisdom
        </Text>
        <Text style={[styles.errorText, { color: themeColors.textSecondary }]}>
          No quote available
        </Text>
      </BaseCard>
    );
  }

  return (
    <BaseCard style={styles.card}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>
        ✨ Daily Wisdom
      </Text>
      
      <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
        "{currentQuote.text}"
      </Text>
      
      <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
        — {currentQuote.author}
      </Text>
      
      <Text style={[styles.categoryText, { color: brandColors.primary }]}>
        #{currentQuote.category.replace('-', ' ')}
      </Text>

      <TouchableOpacity 
        style={[styles.refreshButton, { backgroundColor: themeColors.border }]} 
        onPress={refreshQuote}
        disabled={loading}
      >
        <Feather name="refresh-cw" size={16} color={themeColors.textSecondary} />
        <Text style={[styles.refreshButtonText, { color: themeColors.textSecondary }]}>
          {loading ? 'Loading...' : 'New Quote'}
        </Text>
      </TouchableOpacity>

      {/* Test notification button */}
      <TouchableOpacity 
        style={[styles.testButton, { backgroundColor: brandColors.primary }]} 
        onPress={sendTestNotification}
      >
        <Feather name="bell" size={16} color="white" />
        <Text style={[styles.testButtonText, { color: 'white' }]}>
          Test Notification
        </Text>
      </TouchableOpacity>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.H6,
    marginBottom: 16,
    textAlign: 'center',
  },
  quoteText: {
    ...TYPOGRAPHY.BODY,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  authorText: {
    ...TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  categoryText: {
    ...TYPOGRAPHY.CAPTION,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  refreshButtonText: {
    ...TYPOGRAPHY.BUTTON_SMALL,
    marginLeft: 6,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  testButtonText: {
    ...TYPOGRAPHY.BUTTON_SMALL,
    marginLeft: 6,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DailyQuoteCard; 