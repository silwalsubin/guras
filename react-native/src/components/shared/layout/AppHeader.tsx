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
        <View style={[styles.logo, { backgroundColor: brandColors.primary }]}>
          <Text style={styles.logoText}>🧘</Text>
        </View>
        <Text style={[styles.appName, { color: themeColors.textPrimary }]}>
          guras
        </Text>
      </View>
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
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
  },
  appName: {
    ...TYPOGRAPHY.H4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileButtonText: {
    fontSize: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default AppHeader; 