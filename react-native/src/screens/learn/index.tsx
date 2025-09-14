import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { getThemeColors, getBrandColors, COLORS } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import {
  AppHeader,
  QuickActionCard,
  HorizontalSeparator,
} from '@/components/shared';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, TAB_KEYS } from '@/store/navigationSlice';
import { RootState } from '@/store';
import { RefreshUtils } from '@/utils/refreshUtils';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgramsList from '@/components/meditation/ProgramsList';
import TeachersList from '@/components/meditation/TeachersList';
import ThemedSessionsModal from '@/components/meditation/ThemedSessionsModal';
import GuidedMeditationModal from '@/components/meditation/GuidedMeditationModal';
import { MeditationTheme, GuidedMeditationSession } from '@/types/meditation';

const LearnScreen = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const [refreshing, setRefreshing] = useState(false);

  // Meditation-related state
  const [themedSessionsModalVisible, setThemedSessionsModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<MeditationTheme | undefined>();
  const [guidedMeditationModalVisible, setGuidedMeditationModalVisible] = useState(false);
  const [selectedGuidedSession, setSelectedGuidedSession] = useState<GuidedMeditationSession | null>(null);

  const handleLearningAction = (action: string) => {
    console.log(`Learning action: ${action}`);
    // Add navigation logic based on action
  };

  const handleGuidedSessionSelect = (session: GuidedMeditationSession) => {
    console.log('Selected guided session:', session.title);
    setSelectedGuidedSession(session);
    setGuidedMeditationModalVisible(true);
  };

  const handleGuidedSessionComplete = (session: GuidedMeditationSession) => {
    console.log('Completed guided session:', session.title);
    // TODO: Update user progress, save completion data, etc.
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing learn screen content...');
      
      const result = await RefreshUtils.refreshLearnScreen();
      
      if (result.success) {
        console.log('✅ Learn screen refreshed successfully');
      } else {
        console.warn('⚠️ Some items failed to refresh:', result.errors);
      }
      
    } catch (error) {
      console.error('Error refreshing learn screen:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: themeColors.background }]}
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

        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: themeColors.textPrimary }]}>
            Learn & Grow
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Explore spiritual wisdom and deepen your practice
          </Text>
        </View>

        {/* Learning Categories */}
        <HorizontalSeparator marginVertical={0} height={4} />
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
              <Icon name="graduation-cap" size={16} color={brandColors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
                Learning Categories
              </Text>
              <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
                Explore different areas of spiritual growth
              </Text>
            </View>
          </View>
          <View style={styles.categoriesGrid}>
            <QuickActionCard
              icon="📖"
              title="Teachings"
              onPress={() => handleLearningAction('Teachings')}
            />
            <QuickActionCard
              icon="🎓"
              title="Courses"
              onPress={() => handleLearningAction('Courses')}
            />
            <QuickActionCard
              icon="💭"
              title="Philosophy"
              onPress={() => handleLearningAction('Philosophy')}
            />
            <QuickActionCard
              icon="🌱"
              title="Growth"
              onPress={() => handleLearningAction('Growth')}
            />
          </View>
        </View>
        <HorizontalSeparator marginVertical={0} height={4} />

        {/* Meditation Programs */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <ProgramsList
            maxItems={3}
            onProgramStart={(program, day) => {
              console.log('Starting program session:', program.title, 'Day:', day);
              // TODO: Navigate to guided meditation session
            }}
          />
        </View>
        <HorizontalSeparator marginVertical={0} height={4} />

        {/* Browse by Theme */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
              <Icon name="tags" size={16} color={brandColors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
                Browse by Theme
              </Text>
              <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
                Find sessions for your needs
              </Text>
            </View>
          </View>

          <View style={styles.themeGrid}>
            {[
              { theme: 'stress-relief', label: 'Stress Relief', icon: 'heart', count: 12 },
              { theme: 'sleep', label: 'Sleep', icon: 'moon-o', count: 8 },
              { theme: 'focus', label: 'Focus', icon: 'eye', count: 6 },
              { theme: 'anxiety', label: 'Anxiety', icon: 'shield', count: 9 },
              { theme: 'gratitude', label: 'Gratitude', icon: 'smile-o', count: 5 },
              { theme: 'mindfulness', label: 'Mindfulness', icon: 'leaf', count: 15 },
            ].map((item) => (
              <TouchableOpacity
                key={item.theme}
                style={[styles.themeItem, { backgroundColor: themeColors.background }]}
                onPress={() => {
                  setSelectedTheme(item.theme as MeditationTheme);
                  setThemedSessionsModalVisible(true);
                }}
              >
                <Icon name={item.icon} size={24} color={brandColors.primary} />
                <Text style={[styles.themeLabel, { color: themeColors.textPrimary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.themeCount, { color: themeColors.textSecondary }]}>
                  {item.count} sessions
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <HorizontalSeparator marginVertical={0} height={4} />

        {/* Teachers */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <TeachersList
            compact={true}
            maxItems={3}
            onSessionSelect={handleGuidedSessionSelect}
          />
        </View>

        {/* Bottom padding to prevent content from being hidden by footer */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      <ThemedSessionsModal
        visible={themedSessionsModalVisible}
        onClose={() => setThemedSessionsModalVisible(false)}
        onSessionSelect={handleGuidedSessionSelect}
        initialTheme={selectedTheme}
        title="Browse Guided Sessions"
      />
      <GuidedMeditationModal
        visible={guidedMeditationModalVisible}
        session={selectedGuidedSession}
        onClose={() => setGuidedMeditationModalVisible(false)}
        onSessionComplete={handleGuidedSessionComplete}
      />
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 100,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  mainTitle: {
    ...TYPOGRAPHY.H4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    maxWidth: 280,
  },
  // Card Styles
  card: {
    borderRadius: 0,
    padding: 20,
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
    marginBottom: 16,
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
  cardSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  // Theme Grid Styles
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  themeCount: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Add bottom padding to account for the footer
  bottomPadding: {
    height: 100, // Account for bottom navigation + safe area
  },
});

export default LearnScreen; 