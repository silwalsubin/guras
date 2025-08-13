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
  QuickStartCard,
  ProgressCard,
  QuickActionCard,
  RecentSessionsCard,
  ProgressData,
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

  const handleBeginSession = () => {
    dispatch(setActiveTab(TAB_KEYS.AUDIO));
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Add navigation logic based on action
    if (action === 'Meditate') {
      dispatch(setActiveTab(TAB_KEYS.AUDIO));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing activity screen data...');
      
      const result = await RefreshUtils.refreshHomeScreen();
      
      if (result.success) {
        console.log('✅ Activity screen refreshed successfully');
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

      {/* Quick Start Card */}
      <View style={styles.quickStartSection}>
        <QuickStartCard 
          onBeginSession={handleBeginSession}
        />
      </View>

      {/* Daily Progress */}
      <View style={styles.progressSection}>
        <SectionHeader title="Today's Progress" />
        <ProgressCard 
          data={progressData}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActionsGrid}>
          <QuickActionCard 
            icon="🧘‍♀️" 
            title="Meditate" 
            onPress={() => handleQuickAction('Meditate')}
          />
          <QuickActionCard 
            icon="🕯️" 
            title="Mindfulness" 
            onPress={() => handleQuickAction('Mindfulness')}
          />
          <QuickActionCard 
            icon="🌙" 
            title="Sleep" 
            onPress={() => handleQuickAction('Sleep')}
          />
          <QuickActionCard 
            icon="📿" 
            title="Wisdom" 
            onPress={() => handleQuickAction('Wisdom')}
          />
        </View>
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
  quickStartSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  // Add bottom padding to account for the footer
  bottomPadding: {
    height: 100, // Account for bottom navigation + safe area
  },
});

export default ActivityScreen;
