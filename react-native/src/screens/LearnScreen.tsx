import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import {
  AppHeader,
  SectionHeader,
  BaseCard,
  QuickActionCard,
} from '@/components/shared';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, TAB_KEYS } from '@/store/navigationSlice';
import { RootState } from '@/store';

const LearnScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  const handleLearningAction = (action: string) => {
    console.log(`Learning action: ${action}`);
    // Add navigation logic based on action
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
      <View style={styles.categoriesSection}>
        <SectionHeader title="Learning Categories" />
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

      {/* Daily Wisdom */}
      <View style={styles.wisdomSection}>
        <SectionHeader title="Daily Wisdom" />
        <BaseCard style={styles.wisdomCard}>
          <Text style={[styles.wisdomQuote, { color: themeColors.textPrimary }]}>
            "The mind is everything. What you think you become."
          </Text>
          <Text style={[styles.wisdomAuthor, { color: themeColors.textSecondary }]}>
            - Buddha
          </Text>
        </BaseCard>
      </View>

      {/* Featured Content */}
      <View style={styles.featuredSection}>
        <SectionHeader title="Featured Content" />
        <BaseCard style={styles.featuredCard}>
          <Text style={[styles.featuredTitle, { color: themeColors.textPrimary }]}>
            Introduction to Mindfulness
          </Text>
          <Text style={[styles.featuredDescription, { color: themeColors.textSecondary }]}>
            Learn the fundamentals of mindfulness meditation and how to incorporate it into your daily life.
          </Text>
          <Text style={[styles.featuredDuration, { color: themeColors.textSecondary }]}>
            ⏱️ 15 min read
          </Text>
        </BaseCard>
      </View>

      {/* Progress Tracking */}
      <View style={styles.progressSection}>
        <SectionHeader title="Your Learning Progress" />
        <BaseCard>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
              Articles Read
            </Text>
            <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>
              0
            </Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
              Courses Completed
            </Text>
            <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>
              0
            </Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
              Study Streak
            </Text>
            <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>
              0 days
            </Text>
          </View>
        </BaseCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  mainTitle: {
    ...TYPOGRAPHY.H2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    maxWidth: 280,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wisdomSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  wisdomCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  wisdomQuote: {
    ...TYPOGRAPHY.BODY_LARGE,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 24,
  },
  wisdomAuthor: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '600',
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  featuredCard: {
    paddingVertical: 24,
  },
  featuredTitle: {
    ...TYPOGRAPHY.H5,
    marginBottom: 8,
  },
  featuredDescription: {
    ...TYPOGRAPHY.BODY,
    marginBottom: 12,
    lineHeight: 20,
  },
  featuredDuration: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '500',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    ...TYPOGRAPHY.BODY,
  },
  progressValue: {
    ...TYPOGRAPHY.BODY_LARGE,
    fontWeight: 'bold',
  },
});

export default LearnScreen; 