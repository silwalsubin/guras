import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import BaseCard from './BaseCard';
import { RootState } from '@/store';
import Icon from 'react-native-vector-icons/FontAwesome';

const RecentSessionsCard: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  return (
    <BaseCard style={styles.card}>
      <View style={styles.emptyState}>
        <View style={[styles.iconContainer, { backgroundColor: `${brandColors.primary}10` }]}>
          <Icon name="leaf" size={32} color={brandColors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
          No sessions yet
        </Text>
        <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
          Start your first meditation to see your history here
        </Text>
      </View>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...TYPOGRAPHY.H5,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
});

export default RecentSessionsCard; 