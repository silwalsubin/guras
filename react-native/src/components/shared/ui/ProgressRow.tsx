import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';

interface ProgressRowProps {
  label: string;
  value: string | number;
}

const ProgressRow: React.FC<ProgressRowProps> = ({ 
  label, 
  value
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <View style={styles.progressRow}>
      <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressRow: {
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

export default ProgressRow; 