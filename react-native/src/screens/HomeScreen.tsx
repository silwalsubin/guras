import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setActiveTab, TAB_KEYS } from '@/store/navigationSlice';
import {
  AppHeader,
  SectionHeader,
  QuickStartCard,
  ProgressCard,
  QuickActionCard,
  RecentSessionsCard,
  DailyQuoteCard,
  ProgressData,
} from '@/components/shared';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch();

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

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <AppHeader 
        onProfilePress={() => dispatch(setActiveTab(TAB_KEYS.PROFILE))} 
      />

      {/* Daily Quote */}
      <View style={styles.quoteSection}>
        <DailyQuoteCard />
      </View>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  quoteSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
});

export default HomeScreen; 