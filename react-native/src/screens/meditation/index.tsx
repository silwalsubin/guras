import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setBottomNavVisibility } from '@/store/bottomNavSlice';
import { RefreshUtils } from '@/utils/refreshUtils';
import { getThemeColors, getBrandColors } from '@/config/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  MeditationTimer,
  SemiTransparentCard,
} from '@/components/shared';
import GuidedProgressDashboard from '@/components/meditation/GuidedProgressDashboard';
import VideoBackground from '@/components/meditation/VideoBackground';

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
  const bottomNavState = useSelector((state: RootState) => state.bottomNav);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'timer' | 'progress' | 'future'>('timer');

  // Animated text for Now tab
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const nowTexts = ['Now', 'Here', 'Present'];

  // Slide functionality
  const screenWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef<ScrollView>(null);

  // Dynamic bottom padding based on navigation visibility
  const dynamicBottomPadding = {
    height: bottomNavState.isHidden ? 40 : 120, // Reduced padding when nav is hidden
  };

  // Bottom navigation auto-hide functionality
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  // Handle scroll for bottom navigation auto-hide
  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;

    // Only trigger if scroll difference is significant (avoid micro-scrolls)
    if (Math.abs(scrollDiff) > 5) {
      const newDirection = scrollDiff > 0 ? 'up' : 'down';

      // Only update if direction changed
      if (newDirection !== scrollDirection.current) {
        scrollDirection.current = newDirection;

        // Update bottom navigation visibility via Redux
        // scrolling UP (reading content) = hide navigation
        // scrolling DOWN (likely wanting to navigate) = show navigation
        dispatch(setBottomNavVisibility(newDirection === 'down')); // true = visible, false = hidden
      }
    }

    lastScrollY.current = currentScrollY;
  }, [dispatch]);

  // Get meditation state for real progress data
  const meditationState = useSelector((state: RootState) => state.meditation);
  const { isFullScreen } = meditationState;

  // Handle slide/swipe between sections
  const handleSlideToSection = (section: 'timer' | 'progress' | 'future') => {
    let targetIndex: number;
    if (section === 'progress') {
      targetIndex = 0; // past
    } else if (section === 'timer') {
      targetIndex = 1; // now
    } else {
      targetIndex = 2; // future
    }

    scrollViewRef.current?.scrollTo({
      x: targetIndex * screenWidth,
      animated: true,
    });
    setActiveSection(section);
  };

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / screenWidth);

    let newSection: 'timer' | 'progress' | 'future';
    if (currentIndex === 0) {
      newSection = 'progress'; // past
    } else if (currentIndex === 1) {
      newSection = 'timer'; // now
    } else {
      newSection = 'future';
    }

    if (newSection !== activeSection) {
      setActiveSection(newSection);
    }
  };

  // Initialize scroll position to center (Now tab)
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: screenWidth, // Middle section (index 1)
        animated: false,
      });
    }, 100); // Small delay to ensure ScrollView is mounted

    return () => clearTimeout(timer);
  }, [screenWidth]);

  // Animation effect for Now tab text rotation
  useEffect(() => {
    const animateText = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % nowTexts.length);
    };

    const interval = setInterval(animateText, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, [fadeAnim, nowTexts.length]);

  // Ensure bottom navigation is visible when entering meditation screen
  useEffect(() => {
    dispatch(setBottomNavVisibility(true)); // Show bottom nav when mounting
  }, [dispatch]);

  // Cleanup: Show bottom navigation when leaving meditation screen
  useEffect(() => {
    return () => {
      dispatch(setBottomNavVisibility(true)); // Show bottom nav when unmounting
    };
  }, [dispatch]);

  const handleMeditationComplete = (duration: number) => {
    // Track meditation session completion
    console.log(`Meditation session completed: ${duration} minutes`);
    // TODO: Update progress data, save to storage, etc.
  };



  const renderStreakCard = () => (
    <SemiTransparentCard>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
          <Icon name="fire" size={16} color={brandColors.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            Meditation Streak
          </Text>
          <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
            Your dedication so far
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
    </SemiTransparentCard>
  );

  const renderStatsCard = () => (
    <SemiTransparentCard>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
          <Icon name="bar-chart" size={16} color={brandColors.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            Your Statistics
          </Text>
          <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
            Your journey in numbers
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
    </SemiTransparentCard>
  );

  const renderWeeklyProgress = () => (
    <SemiTransparentCard>
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
    </SemiTransparentCard>
  );

  const renderSectionTabs = () => (
    <View style={styles.tabContainer}>
      {/* Active tab label above dots */}
      <View style={styles.labelContainer}>
        {[
          { key: 'progress', label: 'Past', icon: 'bar-chart' },
          { key: 'timer', label: 'Now', icon: 'play-circle' },
          { key: 'future', label: 'Future', icon: 'calendar-plus-o' },
        ].map((tab) => {
          if (activeSection !== tab.key) return null;

          return (
            <View key={tab.key} style={styles.activeLabelWrapper}>
              {tab.key === 'timer' ? (
                <Animated.Text style={[
                  styles.tabText,
                  styles.enhancedTabText,
                  {
                    opacity: fadeAnim,
                  }
                ]}>
                  {nowTexts[currentTextIndex]}
                </Animated.Text>
              ) : (
                <Text style={[
                  styles.tabText,
                  styles.enhancedTabText,
                ]}>
                  {tab.label}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Three dots row */}
      <View style={styles.dotsContainer}>
        {[
          { key: 'progress', label: 'Past', icon: 'bar-chart' },
          { key: 'timer', label: 'Now', icon: 'play-circle' },
          { key: 'future', label: 'Future', icon: 'calendar-plus-o' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.dotTab}
            onPress={() => handleSlideToSection(tab.key as any)}
          >
            <View style={[
              styles.tabDot,
              activeSection === tab.key ? styles.activeDot : styles.inactiveDot,
              {
                backgroundColor: activeSection === tab.key
                  ? '#FFFFFF' // Bright white for active dot
                  : 'rgba(255, 255, 255, 0.3)', // Much more transparent for inactive dots
                // Enhanced drop shadow for all dots
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeSection === tab.key ? 0.8 : 0.3,
                shadowRadius: activeSection === tab.key ? 4 : 2,
                elevation: activeSection === tab.key ? 6 : 2,
              }
            ]} />
          </TouchableOpacity>
        ))}
      </View>
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
    </>
  );

  const renderProgressSection = () => (
    <>
      {/* Quick Stats Summary for Past Tab */}
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

      <View style={styles.pastCardWrapper}>
        {renderStreakCard()}
      </View>
      <View style={styles.pastCardWrapper}>
        {renderStatsCard()}
      </View>
      <View style={styles.pastCardWrapper}>
        {renderWeeklyProgress()}
      </View>

      {/* Monthly Progress Chart */}
      <View style={styles.pastCardWrapper}>
        <SemiTransparentCard>
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
        </SemiTransparentCard>
      </View>

      {/* Meditation Event Log */}
      <View style={styles.pastCardWrapper}>
        <SemiTransparentCard>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="list-alt" size={16} color={brandColors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Meditation Log
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              Every step you've taken
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
      </SemiTransparentCard>
      </View>

      {/* Guided Meditation Progress */}
      <GuidedProgressDashboard
        onAchievementPress={(achievementId) => {
          console.log('Achievement pressed:', achievementId);
          // TODO: Show achievement details modal
        }}
        onMilestonePress={(milestoneId) => {
          console.log('Milestone pressed:', milestoneId);
          // TODO: Show milestone details modal
        }}
      />
    </>
  );

  const renderFutureSection = () => (
    <>
      {/* Tomorrow's Plan Card */}
      <View style={styles.pastCardWrapper}>
        <SemiTransparentCard>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="calendar-plus-o" size={16} color={brandColors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Tomorrow's Plan
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              Set your intention for tomorrow
            </Text>
          </View>
        </View>

        <View style={styles.futureActionContainer}>
          <TouchableOpacity style={[styles.futureActionButton, { backgroundColor: brandColors.primary + '10', borderColor: brandColors.primary + '30' }]}>
            <Icon name="clock-o" size={16} color={brandColors.primary} />
            <Text style={[styles.futureActionText, { color: brandColors.primary }]}>Schedule Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.futureActionButton, { backgroundColor: brandColors.primary + '10', borderColor: brandColors.primary + '30' }]}>
            <Icon name="target" size={16} color={brandColors.primary} />
            <Text style={[styles.futureActionText, { color: brandColors.primary }]}>Set Goal</Text>
          </TouchableOpacity>
        </View>
      </SemiTransparentCard>
      </View>

      {/* Weekly Goals Card */}
      <View style={styles.pastCardWrapper}>
        <SemiTransparentCard>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#FF9500' + '20' }]}>
            <Icon name="bullseye" size={16} color="#FF9500" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              This Week's Goals
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              Your meditation intentions
            </Text>
          </View>
        </View>

        <View style={styles.goalsList}>
          <View style={styles.goalItem}>
            <View style={[styles.goalIcon, { backgroundColor: '#4CAF50' + '20' }]}>
              <Icon name="check" size={12} color="#4CAF50" />
            </View>
            <Text style={[styles.goalText, { color: themeColors.textPrimary }]}>Meditate 5 days this week</Text>
            <Text style={[styles.goalProgress, { color: themeColors.textSecondary }]}>3/5</Text>
          </View>

          <View style={styles.goalItem}>
            <View style={[styles.goalIcon, { backgroundColor: brandColors.primary + '20' }]}>
              <Icon name="clock-o" size={12} color={brandColors.primary} />
            </View>
            <Text style={[styles.goalText, { color: themeColors.textPrimary }]}>Complete 100 minutes</Text>
            <Text style={[styles.goalProgress, { color: themeColors.textSecondary }]}>67/100</Text>
          </View>

          <View style={styles.goalItem}>
            <View style={[styles.goalIcon, { backgroundColor: '#FF9500' + '20' }]}>
              <Icon name="fire" size={12} color="#FF9500" />
            </View>
            <Text style={[styles.goalText, { color: themeColors.textPrimary }]}>Maintain streak</Text>
            <Text style={[styles.goalProgress, { color: themeColors.textSecondary }]}>7 days</Text>
          </View>
        </View>
      </SemiTransparentCard>

      {/* Upcoming Challenges Card */}
      <SemiTransparentCard>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#9C27B0' + '20' }]}>
            <Icon name="trophy" size={16} color="#9C27B0" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Upcoming Challenges
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              Join the community
            </Text>
          </View>
        </View>

        <View style={styles.challengesList}>
          <View style={styles.challengeItem}>
            <Text style={[styles.challengeTitle, { color: themeColors.textPrimary }]}>30-Day Mindfulness Challenge</Text>
            <Text style={[styles.challengeDate, { color: themeColors.textSecondary }]}>Starts Feb 1st</Text>
            <TouchableOpacity style={[styles.joinButton, { backgroundColor: '#9C27B0' + '10', borderColor: '#9C27B0' + '30' }]}>
              <Text style={[styles.joinButtonText, { color: '#9C27B0' }]}>Join Challenge</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.challengeItem}>
            <Text style={[styles.challengeTitle, { color: themeColors.textPrimary }]}>Morning Meditation Week</Text>
            <Text style={[styles.challengeDate, { color: themeColors.textSecondary }]}>Starts Feb 15th</Text>
            <TouchableOpacity style={[styles.joinButton, { backgroundColor: '#9C27B0' + '10', borderColor: '#9C27B0' + '30' }]}>
              <Text style={[styles.joinButtonText, { color: '#9C27B0' }]}>Join Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SemiTransparentCard>
      </View>
    </>
  );

  // Render the normal meditation screen
  const normalScreen = (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Video Background for entire screen */}
      <VideoBackground showOverlay={true} />

      {/* Status Bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <SafeAreaView style={styles.safeAreaContent}>
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
        {/* Past Section */}
        <View style={[styles.slideContainer, { width: screenWidth }]}>
          <ScrollView
            style={styles.verticalScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
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
            <View style={dynamicBottomPadding} />
          </ScrollView>
        </View>

        {/* Now Section */}
        <View style={[styles.slideContainer, { width: screenWidth }]}>
          <ScrollView
            style={styles.verticalScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
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
            <View style={dynamicBottomPadding} />
          </ScrollView>
        </View>

        {/* Future Section */}
        <View style={[styles.slideContainer, { width: screenWidth }]}>
          <ScrollView
            style={styles.verticalScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
                colors={[brandColors.primary]}
              />
            }
          >
            {renderFutureSection()}
            <View style={dynamicBottomPadding} />
          </ScrollView>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
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
  safeAreaContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
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
    marginBottom: 16, // Reduced from 32 to 16
  },
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 12, // Reduced from 24 to 12
  },
  bottomPadding: {
    height: 120, // Account for bottom navigation + safe area (same as home screen)
  },
  // Tab Navigation Styles
  tabContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dotTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 12, // Bigger active dot
    height: 12,
    borderRadius: 6,
    transform: [{ scale: 1 }], // Can add subtle animation later
  },
  inactiveDot: {
    width: 6, // Smaller inactive dots
    height: 6,
    borderRadius: 3,
    opacity: 0.6, // Additional opacity reduction
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  activeLabelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  activeTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inactiveTab: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  enhancedTabText: {
    color: '#FFFFFF', // Always white for better contrast against dark background
    fontWeight: '600',
    // Enhanced drop shadow for text
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pillTab: {
    marginHorizontal: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    borderRadius: 0,
    padding: 12,
    paddingTop: 10,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
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
    fontSize: 18,
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
    fontSize: 18,
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
  // Quick Stats Styles (for Past tab)
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
    fontSize: 18,
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
    marginTop: 0,
    fontStyle: 'italic',
    lineHeight: 13,
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
  // Future Section Styles
  futureActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  futureActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  futureActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  goalProgress: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengesList: {
    gap: 16,
  },
  challengeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  joinButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Past Card Wrapper for margins
  pastCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 4, // Reduced from 8 to 4
  },


});

export default MeditationScreen;
