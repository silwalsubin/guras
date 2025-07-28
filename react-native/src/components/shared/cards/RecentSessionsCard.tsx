import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import BaseCard from './BaseCard';
import { RootState } from '@/store';

const RecentSessionsCard: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <BaseCard style={styles.recentCard}>
      <Text style={[styles.recentText, { color: themeColors.textSecondary }]}>
        No recent sessions
      </Text>
      <Text style={[styles.recentSubtext, { color: themeColors.textSecondary }]}>
        Start your first meditation to see your history here
      </Text>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  recentCard: {
    alignItems: 'center',
  },
  recentText: {
    ...TYPOGRAPHY.BODY,
    marginBottom: 8,
  },
  recentSubtext: {
    ...TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
  },
});

export default RecentSessionsCard; 