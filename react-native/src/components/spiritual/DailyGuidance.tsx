import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { getDailyGuidance } from '@/store/spiritualTeacherSlice';
import { OshoQuote, OshoPractice } from '@/types/spiritual';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface DailyGuidanceProps {
  onStartPractice?: (practice: OshoPractice) => void;
  onExploreQuote?: (quote: OshoQuote) => void;
}

const DailyGuidance: React.FC<DailyGuidanceProps> = ({
  onStartPractice,
  onExploreQuote,
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const { dailyGuidance, isLoading, spiritualProfile } = useSelector(
    (state: RootState) => state.spiritualTeacher
  );

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (!dailyGuidance) {
      loadGuidance();
    }
  }, []);

  const loadGuidance = async () => {
    try {
      if (spiritualProfile?.userId) {
        await dispatch(getDailyGuidance(spiritualProfile.userId));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load daily guidance. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGuidance();
    setRefreshing(false);
  };

  const handleStartPractice = () => {
    if (dailyGuidance?.dailyPractice && onStartPractice) {
      onStartPractice(dailyGuidance.dailyPractice);
    }
  };

  const handleExploreQuote = () => {
    if (dailyGuidance?.inspirationalQuote && onExploreQuote) {
      onExploreQuote(dailyGuidance.inspirationalQuote);
    }
  };

  const renderQuoteCard = (quote: OshoQuote) => {
    return (
      <View style={[styles.quoteCard, { backgroundColor: themeColors.card }]}>
        <View style={styles.quoteHeader}>
          <FontAwesome name="quote-left" size={20} color={brandColors.primary} />
          <Text style={[styles.quoteCategory, { color: brandColors.primary }]}>
            {quote.category.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
          "{quote.text}"
        </Text>
        <View style={styles.quoteFooter}>
          <Text style={[styles.quoteSource, { color: themeColors.textSecondary }]}>
            — {quote.source.title}
            {quote.source.year && ` (${quote.source.year})`}
          </Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: brandColors.primary }]}
            onPress={handleExploreQuote}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreButtonText}>Explore</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPracticeCard = (practice: OshoPractice) => {
    return (
      <View style={[styles.practiceCard, { backgroundColor: themeColors.card }]}>
        <View style={styles.practiceHeader}>
          <FontAwesome name="play-circle" size={24} color={brandColors.primary} />
          <View style={styles.practiceInfo}>
            <Text style={[styles.practiceName, { color: themeColors.textPrimary }]}>
              {practice.name}
            </Text>
            <Text style={[styles.practiceDuration, { color: themeColors.textSecondary }]}>
              {practice.duration.recommended} minutes • {practice.difficulty}
            </Text>
          </View>
        </View>
        <Text style={[styles.practiceDescription, { color: themeColors.textSecondary }]}>
          {practice.description}
        </Text>
        <View style={styles.practiceBenefits}>
          {practice.benefits.slice(0, 3).map((benefit, index) => (
            <View key={index} style={[styles.benefitChip, { backgroundColor: brandColors.primary }]}>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.startPracticeButton, { backgroundColor: brandColors.primary }]}
          onPress={handleStartPractice}
          activeOpacity={0.8}
        >
          <FontAwesome name="play" size={16} color="#FFFFFF" />
          <Text style={styles.startPracticeText}>Start Practice</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderInsightCard = (insight: string, index: number) => {
    return (
      <View key={index} style={[styles.insightCard, { backgroundColor: themeColors.card }]}>
        <FontAwesome name="lightbulb-o" size={16} color={brandColors.accent} />
        <Text style={[styles.insightText, { color: themeColors.textPrimary }]}>
          {insight}
        </Text>
      </View>
    );
  };

  const renderActionItem = (item: string, index: number) => {
    return (
      <View key={index} style={[styles.actionItem, { backgroundColor: themeColors.background }]}>
        <FontAwesome name="check-circle-o" size={16} color={brandColors.primary} />
        <Text style={[styles.actionText, { color: themeColors.textPrimary }]}>
          {item}
        </Text>
      </View>
    );
  };

  if (!dailyGuidance) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={[styles.emptyState, { backgroundColor: themeColors.card }]}>
          <FontAwesome name="sun-o" size={48} color={themeColors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>
            Daily Guidance
          </Text>
          <Text style={[styles.emptyStateDescription, { color: themeColors.textSecondary }]}>
            Get your personalized daily spiritual guidance from Osho.
          </Text>
          <TouchableOpacity
            style={[styles.loadButton, { backgroundColor: brandColors.primary }]}
            onPress={loadGuidance}
            disabled={isLoading}
          >
            <Text style={styles.loadButtonText}>
              {isLoading ? 'Loading...' : 'Load Daily Guidance'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.card }]}>
        <View style={styles.headerContent}>
          <FontAwesome name="sun-o" size={24} color={brandColors.primary} />
          <View>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
              Daily Guidance
            </Text>
            <Text style={[styles.headerDate, { color: themeColors.textSecondary }]}>
              {new Date(dailyGuidance.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View style={[styles.themeBadge, { backgroundColor: brandColors.primary }]}>
          <Text style={styles.themeText}>{dailyGuidance.theme.toUpperCase()}</Text>
        </View>
      </View>

      {/* Morning Wisdom */}
      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="sunrise" size={20} color={brandColors.primary} />
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Morning Wisdom
          </Text>
        </View>
        <Text style={[styles.wisdomText, { color: themeColors.textSecondary }]}>
          {dailyGuidance.morningWisdom}
        </Text>
      </View>

      {/* Evening Reflection */}
      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="moon-o" size={20} color={brandColors.primary} />
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Evening Reflection
          </Text>
        </View>
        <Text style={[styles.wisdomText, { color: themeColors.textSecondary }]}>
          {dailyGuidance.eveningReflection}
        </Text>
      </View>

      {/* Inspirational Quote */}
      {dailyGuidance.inspirationalQuote && (
        <View style={styles.section}>
          {renderQuoteCard(dailyGuidance.inspirationalQuote)}
        </View>
      )}

      {/* Daily Practice */}
      {dailyGuidance.dailyPractice && (
        <View style={styles.section}>
          {renderPracticeCard(dailyGuidance.dailyPractice)}
        </View>
      )}

      {/* Insights */}
      {dailyGuidance.insights && dailyGuidance.insights.length > 0 && (
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="lightbulb-o" size={20} color={brandColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Today's Insights
            </Text>
          </View>
          {dailyGuidance.insights.map((insight, index) => renderInsightCard(insight, index))}
        </View>
      )}

      {/* Action Items */}
      {dailyGuidance.actionItems && dailyGuidance.actionItems.length > 0 && (
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="list" size={20} color={brandColors.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Action Items
            </Text>
          </View>
          {dailyGuidance.actionItems.map((item, index) => renderActionItem(item, index))}
        </View>
      )}

      {/* Completion Status */}
      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <View style={styles.completionContainer}>
          <View style={styles.completionInfo}>
            <FontAwesome
              name={dailyGuidance.completed ? 'check-circle' : 'circle-o'}
              size={20}
              color={dailyGuidance.completed ? brandColors.primary : themeColors.textSecondary}
            />
            <Text style={[styles.completionText, { color: themeColors.textPrimary }]}>
              {dailyGuidance.completed ? 'Completed Today' : 'Not Completed Yet'}
            </Text>
          </View>
          {!dailyGuidance.completed && (
            <TouchableOpacity
              style={[styles.completeButton, { backgroundColor: brandColors.primary }]}
              onPress={() => {
                // TODO: Mark as completed
                Alert.alert('Completed', 'Great job! You\'ve completed today\'s guidance.');
              }}
            >
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    margin: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loadButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  loadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  headerDate: {
    fontSize: 14,
    marginLeft: 12,
  },
  themeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  themeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  wisdomText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  quoteCard: {
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quoteCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  quoteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quoteSource: {
    fontSize: 14,
    flex: 1,
  },
  exploreButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  practiceCard: {
    padding: 20,
    borderRadius: 12,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  practiceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  practiceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  practiceDuration: {
    fontSize: 14,
    marginTop: 2,
  },
  practiceDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
  },
  practiceBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  benefitChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  startPracticeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  startPracticeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  insightText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  completionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  completeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DailyGuidance;
