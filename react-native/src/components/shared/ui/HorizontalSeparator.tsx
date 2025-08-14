import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors } from '@/config/colors';

interface HorizontalSeparatorProps {
  marginVertical?: number;
  height?: number;
  backgroundColor?: string;
}

const HorizontalSeparator: React.FC<HorizontalSeparatorProps> = ({
  marginVertical = 20,
  height = 1,
  backgroundColor,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  
  // Use theme-aware default color if none provided
  const defaultColor = isDarkMode 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.1)';
  
  const finalColor = backgroundColor || defaultColor;

  return (
    <View
      style={[
        styles.separator,
        {
          marginVertical,
          height,
          backgroundColor: finalColor,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    width: '100%',
    marginVertical: 2,
  },
});

export default HorizontalSeparator;
