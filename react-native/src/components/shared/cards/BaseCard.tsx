import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors, COLORS } from '@/config/colors';
import { RootState } from '@/store';

interface BaseCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

const BaseCard: React.FC<BaseCardProps> = ({ 
  children, 
  style, 
  padding = 20
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: themeColors.card,
        padding: padding 
      }, 
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default BaseCard; 