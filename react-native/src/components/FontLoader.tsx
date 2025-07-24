import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TYPOGRAPHY } from '../config/fonts';
import { COLORS } from '../config/colors';

interface FontLoaderProps {
  children: React.ReactNode;
}

const FontLoader: React.FC<FontLoaderProps> = ({ children }) => {
  // Since we're using react-native-vector-icons and system fonts,
  // we don't need to load custom fonts asynchronously
  // The fonts are already available through the vector icons package
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },
});

export default FontLoader; 