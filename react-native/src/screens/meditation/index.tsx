import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, TAB_KEYS } from '@/store/navigationSlice';
import { RootState } from '@/store';
import { RefreshUtils } from '@/utils/refreshUtils';
import { COLORS, getThemeColors, getBrandColors } from '@/config/colors';
import {
  AppHeader,
  SectionHeader,
  ProgressCard,
  RecentSessionsCard,
  ProgressData,
  MeditationTimer,
} from '@/components/shared';

const MeditationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [refreshing, setRefreshing] = useState(false);

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  // Get meditation state for real progress data
  const meditationState = useSelector((state: RootState) => state.meditation);
  const { isFullScreen } = meditationState;
  const progressData: ProgressData = {
    minutes: meditationState.totalMinutes,
    sessions: meditationState.totalSessions,
    streak: 0, // TODO: Calculate streak from session history
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

  // If in full-screen mode, render only the timer with black background
  if (isFullScreen) {
    return (
      <Modal
        visible={true}
        animationType="none"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <View style={styles.fullScreenModal}>
          <StatusBar
            hidden={true}
            backgroundColor="#000000"
          />
          <MeditationTimer onSessionComplete={handleMeditationComplete} />
        </View>
      </Modal>
    );
  }

  // Normal mode with header and content sections
  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={brandColors.primary}
          colors={[brandColors.primary]}
        />
      }
    >
        {/* Header */}
        <AppHeader
          onProfilePress={() => dispatch(setActiveTab(TAB_KEYS.PROFILE))}
        />

        {/* Meditation Timer - Hero Section */}
        <View style={styles.heroSection}>
          <MeditationTimer onSessionComplete={handleMeditationComplete} />
        </View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
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
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    marginBottom: 32,
    paddingBottom: 16,
  },
  contentContainer: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  bottomPadding: {
    height: 120, // Account for bottom navigation + safe area (same as home screen)
  },
});

export default MeditationScreen;
