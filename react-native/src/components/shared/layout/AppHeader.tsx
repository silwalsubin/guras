import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  onProfilePress: () => void;
}

const AppHeader = ({ onProfilePress }: AppHeaderProps) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const { user } = useAuth();

  // Check if user has a profile picture
  const hasProfilePicture = user?.photoURL && user.photoURL.length > 0;

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={[styles.appName, { color: themeColors.textPrimary, textAlign: 'left' }]}>
          guras
        </Text>
      </View>
      
      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: themeColors.border }]}
          onPress={onProfilePress}
        >
          {hasProfilePicture ? (
            <Image 
              source={{ uri: user.photoURL }} 
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.profileButtonText, { color: themeColors.textPrimary }]}>👤</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Logo on left, buttons on right
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logoContainer: {
    alignItems: 'flex-start', // Left-align the logo text
    flex: 1, // Take up available space on the left
  },
  appName: {
    ...TYPOGRAPHY.LOGO,
    fontSize: 28,
    fontWeight: '700',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButtonText: {
    fontSize: 22,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});

export default AppHeader; 