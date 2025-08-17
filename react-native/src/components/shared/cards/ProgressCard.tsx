import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import BaseCard from './BaseCard';
import Icon from 'react-native-vector-icons/FontAwesome';

export interface ProgressData {
  minutes: number;
  sessions: number;
  streak: number;
}

interface ProgressCardProps {
  data: ProgressData;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ data }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const progressItems = [
    {
      icon: 'clock-o',
      label: 'Minutes',
      value: data.minutes,
      color: brandColors.primary,
    },
    {
      icon: 'play-circle',
      label: 'Sessions',
      value: data.sessions,
      color: '#8B5CF6', // Purple
    },
    {
      icon: 'fire',
      label: 'Streak',
      value: `${data.streak} days`,
      color: '#F59E0B', // Orange
    },
  ];

  return (
    <BaseCard style={styles.card}>
      <View style={styles.progressGrid}>
        {progressItems.map((item, index) => (
          <View key={item.label} style={styles.progressItem}>
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>
              {item.value}
            </Text>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressValue: {
    ...TYPOGRAPHY.H4,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressLabel: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ProgressCard;