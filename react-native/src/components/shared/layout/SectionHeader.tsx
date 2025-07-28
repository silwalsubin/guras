import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';

interface SectionHeaderProps {
  title: string;
  style?: TextStyle;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  style 
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <Text style={[
      styles.sectionTitle, 
      { color: themeColors.textPrimary },
      style
    ]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    ...TYPOGRAPHY.H5,
    marginBottom: 16,
  },
});

export default SectionHeader; 