import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, RefreshControl, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { BaseCard, HorizontalSeparator } from '../../../components/shared';
import Quote from './quote-card';
import { fetchQuotes } from '@/store/quotesSlice';
import { AppDispatch } from '@/store';

const QuotesView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  // Get all quotes state from Redux
  const {
    allQuotes: quotes,
    isLoading: loading,
    isRefreshing: refreshing,
    error
  } = useSelector((state: RootState) => state.quotes);

  const themeColors = getThemeColors(isDarkMode);

  useEffect(() => {
    // Fetch quotes when component mounts
    console.log('🎯 QuotesView: Dispatching fetchQuotes action');
    dispatch(fetchQuotes());
  }, [dispatch]);

  // Debug Redux state
  useEffect(() => {
    console.log('🎯 QuotesView Redux State:', {
      quotesCount: quotes?.length || 0,
      loading,
      refreshing,
      error
    });
  }, [quotes, loading, refreshing, error]);

  const onRefresh = async () => {
    console.log('🔄 Pull-to-refresh triggered');
    
    try {
      // Dispatch the fetchQuotes action to refresh the store
      await dispatch(fetchQuotes()).unwrap();
      console.log('✅ Quotes refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing quotes:', error);
    }
  };

  if (loading && !refreshing) {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../../../assets/app-logo.png')} 
            style={styles.titleIcon}
          />
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Loading...
            </Text>
            <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
              Please wait
            </Text>
          </View>
        </View>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          Loading inspiration...
        </Text>
      </BaseCard>
    );
  }

  if (error) {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../../../assets/app-logo.png')} 
            style={styles.titleIcon}
          />
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Error
            </Text>
            <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
              Something went wrong
            </Text>
          </View>
        </View>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          {error}
        </Text>
      </BaseCard>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../../../assets/app-logo.png')} 
            style={styles.titleIcon}
          />
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              No Quotes Available
            </Text>
            <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
              Try again later
            </Text>
          </View>
        </View>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          No inspirational quotes found
        </Text>
      </BaseCard>
    );
  }

  return (
    <View style={styles.container}>
      {quotes.map((quote, index) => (
        <View key={`${quote.text}-${quote.author}`}>
          <Quote quote={quote} />
          {index < quotes.length - 1 && <HorizontalSeparator />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    margin: 16,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.H2,
    marginBottom: 4,
  },
  authorText: {
    ...TYPOGRAPHY.BODY_SMALL,
    opacity: 0.7,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default QuotesView;
