import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { useAuth } from '@/contexts/AuthContext';

const GreetingBanner: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const { user } = useAuth();

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

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: isDarkMode
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(16, 185, 129, 0.06)',
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.greetingSection}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.textContainer}>
              <Text style={[styles.greeting, { color: themeColors.textPrimary }]}>
                {greeting}, {userName}
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Ready to find your peace?
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  banner: {
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  emoji: {
    fontSize: 40,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    ...TYPOGRAPHY.HEADING_3,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '400',
  },
});

export default GreetingBanner;

