import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import BaseCard from './BaseCard';
import PrimaryButton from '../ui/PrimaryButton';
import { RootState } from '@/store';

interface QuickStartCardProps {
  onBeginSession: () => void;
}

const QuickStartCard: React.FC<QuickStartCardProps> = ({ 
  onBeginSession
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <BaseCard padding={24}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>
        Ready to meditate?
      </Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
        Start your daily practice
      </Text>
      <PrimaryButton 
        title="Begin Session"
        onPress={onBeginSession}
        style={styles.button}
      />
    </BaseCard>
  );
};

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.H4,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    marginBottom: 20,
  },
  button: {
    marginTop: 0,
  },
});

export default QuickStartCard; 