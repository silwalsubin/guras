import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';
import { journalGuidanceService, PersonalizedGuidance } from '@/services/journalGuidanceService';

interface JourneyGreetingProps {
  onJournalPress?: () => void;
  entryCount?: number;
}

const JourneyGreeting: React.FC<JourneyGreetingProps> = ({ onJournalPress, entryCount = 5 }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const { user } = useAuth();
  const journalEntries = useSelector((state: RootState) => state.journal.entries);

  const [guidance, setGuidance] = useState<PersonalizedGuidance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { greeting, emoji, timeOfDay } = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return { greeting: 'Good Morning', emoji: '🌅', timeOfDay: 'morning' };
    } else if (hour < 18) {
      return { greeting: 'Good Afternoon', emoji: '☀️', timeOfDay: 'afternoon' };
    } else {
      return { greeting: 'Good Evening', emoji: '🌙', timeOfDay: 'evening' };
    }
  }, []);

  const userName = user?.displayName?.split(' ')[0] || 'Friend';

  // Fetch personalized guidance if entries exist
  useEffect(() => {
    const fetchGuidance = async () => {
      if (!user?.uid || journalEntries.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await journalGuidanceService.getPersonalizedGuidance(user.uid, entryCount);
        
        if (response.hasEntries) {
          const parsed = journalGuidanceService.parseGuidance(response.guidance);
          setGuidance(parsed);
        } else {
          setGuidance(null);
        }
      } catch (err) {
        console.error('Error fetching personalized guidance:', err);
        setGuidance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuidance();
  }, [user?.uid, journalEntries.length, entryCount]);

  return (
    <View style={styles.container}>
      {journalEntries.length === 0 ? (
        // Empty State - Greeting + Journal Prompt unified
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onJournalPress}
          style={styles.mainContent}
        >
          {/* Greeting + Journal Prompt Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.greetingTextContainer}>
              <Text style={[styles.greeting, { color: themeColors.textPrimary }]}>
                {greeting}, {userName}
              </Text>
              <Text style={[styles.greetingSubtitle, { color: themeColors.textSecondary }]}>
                Your thoughts matter. Share what's on your mind to receive personalized guidance.
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
            ]}
          />

          {/* CTA */}
          <View style={styles.ctaSection}>
            <Text style={[styles.ctaText, { color: brandColors.primary }]}>
              Write your first entry →
            </Text>
          </View>
        </TouchableOpacity>
      ) : isLoading ? (
        // Loading State
        <View style={styles.mainContent}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.greetingTextContainer}>
              <Text style={[styles.greeting, { color: themeColors.textPrimary }]}>
                {greeting}, {userName}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
            ]}
          />

          {/* Loading State */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={brandColors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
              Generating your personalized guidance...
            </Text>
          </View>
        </View>
      ) : guidance ? (
        // Guidance Display - Full width layout
        <View style={styles.mainContent}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.greetingTextContainer}>
              <Text style={[styles.greeting, { color: themeColors.textPrimary }]}>
                {greeting}, {userName}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
            ]}
          />

          {/* Quote Section */}
          <View style={styles.quoteSection}>
            <FontAwesome
              name="quote-left"
              size={16}
              color={brandColors.primary}
              style={styles.quoteIcon}
            />
            <Text style={[styles.quote, { color: themeColors.textPrimary }]}>
              {guidance.quote}
            </Text>
          </View>

          {/* Guidance Section */}
          <View style={styles.guidanceSection}>
            <FontAwesome
              name="lightbulb-o"
              size={16}
              color={brandColors.primary}
              style={styles.guidanceIcon}
            />
            <Text style={[styles.guidanceText, { color: themeColors.textSecondary }]}>
              {guidance.guidance}
            </Text>
          </View>

          {/* Supportive Message Section */}
          <View style={styles.supportiveSection}>
            <FontAwesome
              name="compass"
              size={16}
              color={brandColors.primary}
              style={styles.supportiveIcon}
            />
            <Text style={[styles.supportiveText, { color: themeColors.textSecondary }]}>
              {guidance.supportiveMessage}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  mainContent: {
    gap: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 48,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greeting: {
    ...TYPOGRAPHY.HEADING_3,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  greetingSubtitle: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '400',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1.5,
  },
  // CTA Section
  ctaSection: {
    paddingVertical: 12,
  },
  ctaText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  // Loading State Styles
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 28,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  // Quote Section
  quoteSection: {
    paddingLeft: 14,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    gap: 10,
  },
  quoteIcon: {
    marginTop: 1,
  },
  quote: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  // Guidance Section
  guidanceSection: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
  },
  guidanceIcon: {
    marginTop: 3,
  },
  guidanceText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '400',
    lineHeight: 24,
    flex: 1,
    letterSpacing: 0.2,
  },
  // Supportive Section
  supportiveSection: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
  },
  supportiveIcon: {
    marginTop: 3,
  },
  supportiveText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '400',
    lineHeight: 24,
    flex: 1,
    letterSpacing: 0.2,
  },
});

export default JourneyGreeting;

