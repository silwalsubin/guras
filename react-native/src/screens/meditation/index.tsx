import React, { useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, TAB_KEYS } from '@/store/navigationSlice';
import { RootState } from '@/store';
import { RefreshUtils } from '@/utils/refreshUtils';
import { getThemeColors, getBrandColors } from '@/config/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  AppHeader,
  MeditationTimer,
} from '@/components/shared';

// Enhanced mock data for comprehensive meditation tracking
const mockData = {
  currentStreak: 7,
  longestStreak: 21,
  totalSessions: 45,
  totalMinutes: 892,
  weeklyMinutes: [45, 30, 60, 0, 25, 40, 35], // Last 7 days
  monthlyMinutes: 285, // This month
  completionRate: 85,
  favoriteTime: '7:00 AM',
  averageSessionLength: 19.8,
  achievements: [
    { id: 1, name: 'First Steps', description: 'Complete your first meditation', earned: true, icon: 'star' },
    { id: 2, name: 'Week Warrior', description: '7-day meditation streak', earned: true, icon: 'fire' },
    { id: 3, name: 'Mindful Month', description: '30-day meditation streak', earned: false, icon: 'calendar', progress: 23, target: 30 },
    { id: 4, name: 'Century Club', description: 'Complete 100 meditation sessions', earned: false, icon: 'trophy', progress: 45, target: 100 },
    { id: 5, name: 'Time Master', description: 'Meditate for 1000 minutes total', earned: false, icon: 'clock-o', progress: 892, target: 1000 },
  ],
  recentSessions: [
    { date: '2025-01-20', duration: 20, completed: true, mood: { before: 3, after: 4 } },
    { date: '2025-01-19', duration: 15, completed: true, mood: { before: 2, after: 4 } },
    { date: '2025-01-18', duration: 25, completed: true, mood: { before: 3, after: 5 } },
    { date: '2025-01-17', duration: 10, completed: false, mood: { before: 2, after: null } },
  ],
};

const MeditationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'timer' | 'progress'>('timer');

  // Slide functionality
  const screenWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef<ScrollView>(null);

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  // Get meditation state for real progress data
  const meditationState = useSelector((state: RootState) => state.meditation);
  const { isFullScreen } = meditationState;

  // Handle slide/swipe between sections
  const handleSlideToSection = (section: 'timer' | 'progress') => {
    const targetIndex = section === 'timer' ? 0 : 1;
    scrollViewRef.current?.scrollTo({
      x: targetIndex * screenWidth,
      animated: true,
    });
    setActiveSection(section);
  };

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / screenWidth);
    const newSection = currentIndex === 0 ? 'timer' : 'progress';

    if (newSection !== activeSection) {
      setActiveSection(newSection);
    }
  };







  const handleMeditationComplete = (duration: number) => {
    // Track meditation session completion
    console.log(`Meditation session completed: ${duration} minutes`);
    // TODO: Update progress data, save to storage, etc.
  };

  const renderStreakCard = () => (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
          <Icon name="fire" size={16} color={brandColors.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            Meditation Streak
          </Text>
          <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
            Keep the momentum going
          </Text>
        </View>
      </View>
      <View style={styles.streakContainer}>
        <View style={styles.streakItem}>
          <Text style={[styles.streakNumber, { color: brandColors.primary }]}>
            {mockData.currentStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: themeColors.textSecondary }]}>
            Current Streak
          </Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <Text style={[styles.streakNumber, { color: themeColors.textPrimary }]}>
            {mockData.longestStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: themeColors.textSecondary }]}>
            Longest Streak
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStatsCard = () => (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
          <Icon name="bar-chart" size={16} color={brandColors.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            Your Statistics
          </Text>
          <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
            Track your progress
          </Text>
        </View>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: brandColors.primary }]}>
            {mockData.totalSessions}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Total Sessions
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: brandColors.primary }]}>
            {Math.floor(mockData.totalMinutes / 60)}h {mockData.totalMinutes % 60}m
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Total Time
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: brandColors.primary }]}>
            {mockData.completionRate}%
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Completion Rate
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: brandColors.primary }]}>
            {mockData.averageSessionLength.toFixed(1)}m
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Avg Session
          </Text>
        </View>
      </View>
    </View>
  );

  const renderWeeklyProgress = () => (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
          <Icon name="calendar" size={16} color={brandColors.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            This Week
          </Text>
          <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
            Daily meditation minutes
          </Text>
        </View>
      </View>
      <View style={styles.weeklyChart}>
        {mockData.weeklyMinutes.map((minutes, index) => {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const maxMinutes = Math.max(...mockData.weeklyMinutes);
          const height = minutes > 0 ? Math.max((minutes / maxMinutes) * 60, 8) : 4;

          return (
            <View key={index} style={styles.dayColumn}>
              <View
                style={[
                  styles.dayBar,
                  {
                    height,
                    backgroundColor: minutes > 0 ? brandColors.primary : themeColors.border,
                  },
                ]}
              />
              <Text style={[styles.dayLabel, { color: themeColors.textSecondary }]}>
                {dayNames[index]}
              </Text>
              <Text style={[styles.dayMinutes, { color: themeColors.textPrimary }]}>
                {minutes}m
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderSectionTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { key: 'timer', label: 'Meditate', icon: 'play-circle' },
        { key: 'progress', label: 'Progress', icon: 'bar-chart' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => handleSlideToSection(tab.key as any)}
        >
          <Text style={[
            styles.tabText,
            {
              color: activeSection === tab.key ? brandColors.primary : themeColors.textSecondary,
              fontWeight: activeSection === tab.key ? '600' : '400',
            }
          ]}>
            {tab.label}
          </Text>
          {activeSection === tab.key && (
            <View style={[styles.tabIndicator, { backgroundColor: brandColors.primary }]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

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

  const renderTimerSection = () => (
    <>
      {/* Meditation Timer - Hero Section */}
      <View style={styles.heroSection}>
        <MeditationTimer onSessionComplete={handleMeditationComplete} forceFullScreen={false} />
      </View>

      {/* Quick Stats Summary for Meditate Tab */}
      <View style={styles.quickStatsSection}>
        <Text style={[styles.quickStatsTitle, { color: themeColors.textPrimary }]}>
          Your Journey
        </Text>
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatItem}>
            <Text style={[styles.quickStatNumber, { color: brandColors.primary }]}>
              {mockData.totalSessions}
            </Text>
            <Text style={[styles.quickStatLabel, { color: themeColors.textSecondary }]}>
              Sessions
            </Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={[styles.quickStatNumber, { color: brandColors.primary }]}>
              {Math.floor(mockData.totalMinutes / 60)}h {mockData.totalMinutes % 60}m
            </Text>
            <Text style={[styles.quickStatLabel, { color: themeColors.textSecondary }]}>
              Total Time
            </Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={[styles.quickStatNumber, { color: brandColors.primary }]}>
              {mockData.currentStreak}
            </Text>
            <Text style={[styles.quickStatLabel, { color: themeColors.textSecondary }]}>
              Day Streak
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderProgressSection = () => (
    <>
      {renderStreakCard()}
      {renderStatsCard()}
      {renderWeeklyProgress()}

      {/* Monthly Progress Chart */}
      <View style={[styles.card, { backgroundColor: themeColors.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="calendar" size={16} color={brandColors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              This Year
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              Monthly meditation progress
            </Text>
          </View>
        </View>
        <View style={styles.monthlyChart}>
          {[15, 22, 18, 25, 30, 28, 35, 40, 32, 38, 45, 42].map((minutes, index) => {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const maxMinutes = Math.max(...[15, 22, 18, 25, 30, 28, 35, 40, 32, 38, 45, 42]);
            const height = minutes > 0 ? Math.max((minutes / maxMinutes) * 80, 8) : 4;

            return (
              <View key={index} style={styles.monthColumn}>
                <View
                  style={[
                    styles.monthBar,
                    {
                      height,
                      backgroundColor: minutes > 0 ? brandColors.primary : themeColors.border,
                    },
                  ]}
                />
                <Text style={[styles.monthLabel, { color: themeColors.textSecondary }]}>
                  {monthNames[index]}
                </Text>
                <Text style={[styles.monthMinutes, { color: themeColors.textPrimary }]}>
                  {minutes}m
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Meditation Event Log */}
      <View style={[styles.card, { backgroundColor: themeColors.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="list-alt" size={16} color={brandColors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Meditation Log
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              Complete journey history
            </Text>
          </View>
        </View>

        {/* Event Log Entries */}
        <View style={styles.eventLogContainer}>
          {/* Mock event data - in real app this would come from user's complete history */}
          {[
            { date: '2025-01-20', type: 'session', duration: 20, music: 'Forest Sounds', milestone: null },
            { date: '2025-01-19', type: 'session', duration: 15, music: 'Ocean Waves', milestone: null },
            { date: '2025-01-18', type: 'milestone', duration: 25, music: 'Rain Sounds', milestone: '7-day streak!' },
            { date: '2025-01-17', type: 'session', duration: 10, music: null, milestone: null },
            { date: '2025-01-15', type: 'session', duration: 30, music: 'Mountain Breeze', milestone: null },
            { date: '2025-01-14', type: 'milestone', duration: 20, music: 'Forest Sounds', milestone: 'First 100 minutes!' },
            { date: '2025-01-12', type: 'session', duration: 15, music: 'Ocean Waves', milestone: null },
            { date: '2025-01-10', type: 'session', duration: 25, music: null, milestone: null },
            { date: '2025-01-08', type: 'milestone', duration: 20, music: 'Rain Sounds', milestone: 'First meditation!' },
          ].map((event, index) => (
            <View key={index} style={styles.eventLogItem}>
              {/* Timeline connector */}
              <View style={styles.timelineConnector}>
                <View style={[
                  styles.eventDot,
                  {
                    backgroundColor: event.type === 'milestone'
                      ? '#FFD700'
                      : brandColors.primary
                  }
                ]} />
                {index < 8 && <View style={[styles.connectorLine, { backgroundColor: themeColors.border }]} />}
              </View>

              {/* Event content */}
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventDate, { color: themeColors.textPrimary }]}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={[styles.eventDuration, { color: brandColors.primary }]}>
                    {event.duration}m
                  </Text>
                </View>

                {event.milestone && (
                  <View style={styles.milestoneContainer}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={[styles.milestoneText, { color: '#FFD700' }]}>
                      {event.milestone}
                    </Text>
                  </View>
                )}

                {event.music && (
                  <Text style={[styles.eventMusic, { color: themeColors.textSecondary }]}>
                    🎵 {event.music}
                  </Text>
                )}

                <Text style={[styles.eventTime, { color: themeColors.textSecondary }]}>
                  {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })} •
                  {event.type === 'milestone' ? ' Achievement unlocked' : ' Meditation completed'}
                </Text>
              </View>
            </View>
          ))}

          {/* Load more indicator */}
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={[styles.loadMoreText, { color: brandColors.primary }]}>
              Load earlier sessions...
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );



  // Render the normal meditation screen
  const normalScreen = (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <AppHeader
        onProfilePress={() => dispatch(setActiveTab(TAB_KEYS.PROFILE))}
      />

      {/* Section Tabs */}
      {renderSectionTabs()}

      {/* Horizontal Sliding Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.horizontalScrollView}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {/* Timer Section */}
        <View style={[styles.slideContainer, { width: screenWidth }]}>
          <ScrollView
            style={styles.verticalScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
                colors={[brandColors.primary]}
              />
            }
          >
            {renderTimerSection()}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>

        {/* Progress Section */}
        <View style={[styles.slideContainer, { width: screenWidth }]}>
          <ScrollView
            style={styles.verticalScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
                colors={[brandColors.primary]}
              />
            }
          >
            {renderProgressSection()}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // If in full-screen mode AND meditation is active, render modal with timer
  if (isFullScreen && meditationState.isActive) {
    return (
      <>
        {normalScreen}
        <Modal
          visible={isFullScreen && meditationState.isActive}
          animationType="none"
          presentationStyle="fullScreen"
          statusBarTranslucent={true}
        >
          <View style={styles.fullScreenModal}>
            <StatusBar
              hidden={true}
              backgroundColor="#000000"
            />
            <MeditationTimer onSessionComplete={handleMeditationComplete} forceFullScreen={true} />
          </View>
        </Modal>
      </>
    );
  }

  // Return normal screen when not in full-screen mode
  return normalScreen;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4, // Very minimal spacing from tabs
    paddingBottom: 100, // Space for bottom navigation
  },
  // Slide functionality styles
  horizontalScrollView: {
    flex: 1,
  },
  horizontalScrollContent: {
    flexDirection: 'row',
  },
  slideContainer: {
    flex: 1,
  },
  verticalScrollView: {
    flex: 1,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    marginBottom: 8,
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
  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 16,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    borderRadius: 2,
  },
  // Card Styles
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Streak Card Styles
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  // Stats Grid Styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Weekly Chart Styles
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 20,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayBar: {
    width: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dayMinutes: {
    fontSize: 10,
    fontWeight: '500',
  },
  // Quick Stats Styles (for Meditate tab)
  quickStatsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Session List Styles
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionDuration: {
    fontSize: 14,
  },
  sessionStatus: {
    marginLeft: 12,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Event Log Styles
  cardSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  eventLogContainer: {
    paddingVertical: 8,
  },
  eventLogItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
    paddingBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventDuration: {
    fontSize: 14,
    fontWeight: '600',
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  eventMusic: {
    fontSize: 14,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Monthly Chart Styles (similar to weekly)
  monthlyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 20,
  },
  monthColumn: {
    alignItems: 'center',
    flex: 1,
  },
  monthBar: {
    width: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  monthMinutes: {
    fontSize: 9,
    fontWeight: '500',
  },
});

export default MeditationScreen;
