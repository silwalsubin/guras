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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default BaseCard; 