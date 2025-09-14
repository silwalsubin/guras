import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface TranslucentCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  blurAmount?: number;
  intensity?: number;
}

const TranslucentCard: React.FC<TranslucentCardProps> = ({
  children,
  style,
  contentStyle,
  blurAmount: _blurAmount,
  intensity = 0.8,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  // Clean, elegant translucent effect
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: isDarkMode
          ? `rgba(0, 0, 0, ${0.4 + (intensity * 0.2)})`
          : `rgba(255, 255, 255, ${0.4 + (intensity * 0.2)})`,
        borderColor: isDarkMode
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(0, 0, 0, 0.1)',
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
      style
    ]}>
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});

export default TranslucentCard;
