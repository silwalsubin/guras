import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, TAB_KEYS } from '@/store/navigationSlice';
import { RootState } from '@/store';
import { RefreshUtils } from '@/utils/refreshUtils';
import { COLORS } from '@/config/colors';
import {
  AppHeader,
  SectionHeader,
  ProgressCard,
  RecentSessionsCard,
  ProgressData,
  MeditationTimer,
} from '@/components/shared';

const ActivityScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [refreshing, setRefreshing] = useState(false);

  // Sample progress data
  const progressData: ProgressData = {
    minutes: 0,
    sessions: 0,
    streak: 0,
  };





  const handleMeditationComplete = (duration: number) => {
    // Track meditation session completion
    console.log(`Meditation session completed: ${duration} minutes`);
    // TODO: Update progress data, save to storage, etc.
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await RefreshUtils.refreshHomeScreen();
      
      if (result.success) {
        // Activity screen refreshed successfully
      } else {
        console.warn('⚠️ Some items failed to refresh:', result.errors);
      }
      
    } catch (error) {
      console.error('Error refreshing activity screen:', error);
    } finally {
      setRefreshing(false);
    }
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
          colors={[COLORS.PRIMARY]} // Primary brand color
        />
      }
    >
      {/* Header */}
      <AppHeader 
        onProfilePress={() => dispatch(setActiveTab(TAB_KEYS.PROFILE))} 
      />

      {/* Meditation Timer */}
      <View style={styles.meditationSection}>
        <MeditationTimer onSessionComplete={handleMeditationComplete} />
      </View>

      {/* Daily Progress */}
      <View style={styles.progressSection}>
        <SectionHeader title="Today's Progress" />
        <ProgressCard 
          data={progressData}
        />
      </View>



      {/* Recent Sessions */}
      <View style={styles.recentSection}>
        <SectionHeader title="Recent Sessions" />
        <RecentSessionsCard />
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
    // Don't center all content - let individual sections handle their own alignment
  },
  meditationSection: {
    marginBottom: 20,
    width: '100%',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    width: '100%',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    width: '100%',
  },
  // Add bottom padding to account for the footer
  bottomPadding: {
    height: 100, // Account for bottom navigation + safe area
  },
});

export default ActivityScreen;
