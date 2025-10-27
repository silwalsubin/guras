import React, { useState, useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab, TAB_KEYS } from '@/store/navigationSlice';
import { RootState, AppDispatch } from '@/store';
import { RefreshUtils } from '@/utils/refreshUtils';
import { COLORS } from '@/config/colors';
import { AppHeader } from '@/components/shared';
import AIRecommendedQuote from '@/components/meditation/AIRecommendedQuote';
import RecommendationsList from '@/components/meditation/RecommendationsList';
import { fetchRecommendations } from '@/store/recommendationSlice';
import { MeditationRecommendation } from '@/components/meditation/RecommendationCard';
import { recommendationAnalyticsService } from '@/services/recommendationAnalyticsService';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const recommendations = useSelector((state: RootState) => state.recommendations.recommendations);
  const recommendationsLoading = useSelector((state: RootState) => state.recommendations.loading);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchRecommendations(3));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await RefreshUtils.refreshHomeScreen();

      if (result.success) {
        dispatch(fetchRecommendations(3));
      } else {
        console.warn('⚠️ Some items failed to refresh:', result.errors);
      }

    } catch (error) {
      console.error('Error refreshing home screen:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleProfilePress = useCallback(() => {
    dispatch(setActiveTab(TAB_KEYS.PROFILE));
  }, [dispatch]);

  const handleRecommendationPress = useCallback((recommendation: MeditationRecommendation) => {
    console.log('Selected recommendation:', recommendation.title);

    recommendationAnalyticsService.trackSessionStartFromRecommendation(
      recommendation.title,
      recommendation.theme,
      recommendation.difficulty,
      recommendation.duration,
      undefined,
      { source: 'home_screen' }
    );
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? COLORS.WHITE : COLORS.BLACK}
          colors={[COLORS.PRIMARY]}
        />
      }
    >
      {/* Header */}
      <AppHeader
        onProfilePress={handleProfilePress}
      />

      {/* AI-Recommended Quote */}
      <View style={styles.aiQuoteSection}>
        <AIRecommendedQuote
          onRefresh={() => dispatch(fetchRecommendations(3))}
        />
      </View>

      {/* Personalized Recommendations */}
      <View style={styles.recommendationsSection}>
        <RecommendationsList
          recommendations={recommendations}
          onRecommendationPress={handleRecommendationPress}
          isLoading={recommendationsLoading}
          onRefresh={() => dispatch(fetchRecommendations(3))}
          title="Recommended For You"
          showHeader={true}
        />
      </View>

      {/* Bottom padding to prevent content from being hidden by footer */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  aiQuoteSection: {
    paddingHorizontal: 0,
    marginBottom: 8,
    width: '100%',
  },
  recommendationsSection: {
    paddingHorizontal: 0,
    marginBottom: 20,
    width: '100%',
  },
  bottomPadding: {
    height: 120, // Account for bottom navigation + safe area
  },
});

export default HomeScreen;
