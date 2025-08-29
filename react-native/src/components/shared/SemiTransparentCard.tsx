import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface SemiTransparentCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

const SemiTransparentCard: React.FC<SemiTransparentCardProps> = ({
  children,
  style,
  contentStyle,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: isDarkMode
          ? 'rgba(0, 0, 0, 0.8)'
          : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDarkMode
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(0, 0, 0, 0.1)',
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
    width: '100%',
    alignSelf: 'center',
    marginVertical: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    marginBottom: 28,
    paddingHorizontal: 8,
  },
});

export default SemiTransparentCard;
