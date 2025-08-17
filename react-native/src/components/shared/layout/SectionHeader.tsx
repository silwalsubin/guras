import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';

interface SectionHeaderProps {
  title: string;
  style?: TextStyle;
  showAccent?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  style,
  showAccent = true
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  return (
    <View style={styles.container}>
      {showAccent && (
        <View style={[styles.accent, { backgroundColor: brandColors.primary }]} />
      )}
      <Text style={[
        styles.sectionTitle,
        { color: themeColors.textPrimary },
        style
      ]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H5,
    fontWeight: '700',
    flex: 1,
  },
});

export default SectionHeader;