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
import JourneyGreeting from '@/components/home/JourneyGreeting';
import RecommendationsList from '@/components/meditation/RecommendationsList';
import EmotionTriggersWidget from '@/components/home/EmotionTriggersWidget';
import { fetchRecommendations } from '@/store/recommendationSlice';
import { fetchJournalEntries } from '@/store/journalSlice';
import { fetchEmotionStatistics } from '@/store/emotionStatisticsSlice';
import { MeditationRecommendation } from '@/components/meditation/RecommendationCard';
import { recommendationAnalyticsService } from '@/services/recommendationAnalyticsService';
import { setJournalCreateOpen } from '@/store/bottomNavSlice';
import JournalCreateScreen from '@/screens/journal/JournalCreateScreen';
import EmotionTriggersScreen from '@/screens/home/EmotionTriggersScreen';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmotionTriggersData } from '@/data/mockEmotionTriggersData';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const recommendations = useSelector((state: RootState) => state.recommendations.recommendations);
  const recommendationsLoading = useSelector((state: RootState) => state.recommendations.loading);
  const emotionStatistics = useSelector((state: RootState) => state.emotionStatistics.data);
  const emotionStatisticsLoading = useSelector((state: RootState) => state.emotionStatistics.isLoading);
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showJournalCreate, setShowJournalCreate] = useState(false);
  const [showEmotionTriggers, setShowEmotionTriggers] = useState(false);

  useEffect(() => {
    dispatch(fetchRecommendations(3));
    // Load journal entries for the greeting section
    if (user?.uid) {
      dispatch(fetchJournalEntries({ userId: user.uid }));
      // Fetch emotion statistics for the donut chart
      dispatch(fetchEmotionStatistics());
    }
  }, [dispatch, user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await RefreshUtils.refreshHomeScreen();

      if (result.success) {
        dispatch(fetchRecommendations(3));
        dispatch(fetchEmotionStatistics());
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

  const handleJournalPromptPress = useCallback(() => {
    setShowJournalCreate(true);
    dispatch(setJournalCreateOpen(true));
  }, [dispatch]);

  const handleJournalCreateClose = useCallback(() => {
    setShowJournalCreate(false);
    dispatch(setJournalCreateOpen(false));
  }, [dispatch]);

  const handleEmotionTriggersPress = useCallback(() => {
    setShowEmotionTriggers(true);
  }, []);

  const handleEmotionTriggersClose = useCallback(() => {
    setShowEmotionTriggers(false);
  }, []);

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

  // If emotion triggers screen is open, show it full screen
  if (showEmotionTriggers) {
    return <EmotionTriggersScreen onClose={handleEmotionTriggersClose} />;
  }

  // If journal create screen is open, show it full screen
  if (showJournalCreate) {
    return <JournalCreateScreen onClose={handleJournalCreateClose} />;
  }

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

      {/* Journey Greeting - Combines greeting with journal/guidance */}
      <JourneyGreeting
        onJournalPress={handleJournalPromptPress}
        entryCount={5}
      />

      {/* Emotion Triggers Widget */}
      <EmotionTriggersWidget
        topEmotion={
          emotionStatistics && emotionStatistics.emotions.length > 0
            ? {
                emotion: emotionStatistics.emotions[0].emotionName,
                moodScore: 3,
                emoji: '😊',
                triggers: [],
                entryCount: emotionStatistics.emotions[0].count,
                frequency: Math.round(
                  (emotionStatistics.emotions[0].count / emotionStatistics.totalEntries) * 100
                ),
              }
            : null
        }
        allEmotions={
          emotionStatistics
            ? emotionStatistics.emotions.map((emotion) => ({
                emotion: emotion.emotionName,
                moodScore: 3,
                emoji: '😊',
                triggers: [],
                entryCount: emotion.count,
                frequency: Math.round(
                  (emotion.count / emotionStatistics.totalEntries) * 100
                ),
              }))
            : mockEmotionTriggersData.emotions
        }
        onPress={handleEmotionTriggersPress}
        totalEntries={emotionStatistics?.totalEntries || mockEmotionTriggersData.totalEntries}
      />

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
    paddingTop: 4,
  },
  recommendationsSection: {
    paddingHorizontal: 0,
    marginBottom: 24,
    width: '100%',
  },
  bottomPadding: {
    height: 120, // Account for bottom navigation + safe area
  },
});

export default HomeScreen;
