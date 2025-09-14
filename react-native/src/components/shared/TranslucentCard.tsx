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

  // Clean, elegant translucent effect with proper blur
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: 'transparent',
        borderColor: isDarkMode
          ? 'rgba(255, 255, 255, 0.3)'
          : 'rgba(0, 0, 0, 0.15)',
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      style
    ]}>
      {/* Blur background overlay with backdrop filter effect */}
      <View style={[
        styles.blurOverlay,
        {
          backgroundColor: isDarkMode
            ? `rgba(0, 0, 0, ${0.6 + (intensity * 0.2)})` // Much darker for better text contrast
            : `rgba(255, 255, 255, ${0.6 + (intensity * 0.2)})`, // Much lighter for better text contrast
          // Add backdrop filter effect using multiple layers
          shadowColor: isDarkMode ? '#000' : '#fff',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }
      ]} />
      
      {/* Additional blur layer for better effect */}
      <View style={[
        styles.blurOverlay,
        {
          backgroundColor: isDarkMode
            ? `rgba(0, 0, 0, ${0.2 + (intensity * 0.1)})` // Additional layer
            : `rgba(255, 255, 255, ${0.2 + (intensity * 0.1)})`,
          top: 1,
          left: 1,
          right: 1,
          bottom: 1,
        }
      ]} />
      
      {/* Content with proper z-index */}
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
    zIndex: 2,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    zIndex: 1,
  },
});

export default TranslucentCard;
