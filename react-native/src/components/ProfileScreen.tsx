import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { useColorScheme } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { UserProfile } from '@/types/user';
import SignOutButton from './SignOutButton';
import { TYPOGRAPHY } from '@/config/fonts';
import { getThemeColors, getBrandColors } from '@/config/colors';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.getProfile();
      
      if (response.error) {
        Alert.alert('Error', response.error);
      } else if (response.data) {
        setProfile(response.data);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const renderProfileInfo = (label: string, value: string | boolean | undefined | null) => {
    if (value === undefined || value === null) return null;
    
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    
    return (
      <View style={styles.profileInfo}>
        <Text style={[styles.profileLabel, { color: themeColors.textSecondary }]}>
          {label}:
        </Text>
        <Text style={[styles.profileValue, { color: themeColors.textPrimary }]}>
          {displayValue}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: brandColors.primary }]}>
              <Text style={styles.logoText}>👤</Text>
            </View>
            <Text style={[styles.appName, { color: themeColors.textPrimary }]}>
              Profile
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: themeColors.border }]}
            onPress={onBack}
          >
            <Text style={[styles.backButtonText, { color: themeColors.textPrimary }]}>←</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textPrimary }]}>
            Loading profile...
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: brandColors.primary }]}>
            <Text style={styles.logoText}>👤</Text>
          </View>
          <Text style={[styles.appName, { color: themeColors.textPrimary }]}>
            Profile
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: themeColors.border }]}
          onPress={onBack}
        >
          <Text style={[styles.backButtonText, { color: themeColors.textPrimary }]}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Picture and Basic Info */}
      {profile?.photoUrl && (
        <View style={styles.profilePictureSection}>
          <Image 
            source={{ uri: profile.photoUrl }} 
            style={[styles.profilePicture, { borderColor: brandColors.primary }]}
            resizeMode="cover"
          />
        </View>
      )}

      {/* User Info */}
      <View style={styles.profileSection}>
        <View style={[styles.profileCard, { 
          backgroundColor: themeColors.card,
          shadowColor: themeColors.textSecondary,
        }]}>
          <Text style={[styles.profileTitle, { color: themeColors.textPrimary }]}>
            Account Information
          </Text>
          
          {renderProfileInfo('Display Name', profile?.displayName)}
          {renderProfileInfo('Email', profile?.email)}
          {renderProfileInfo('User ID', profile?.uid)}
          {renderProfileInfo('Email Verified', profile?.emailVerified)}
          
          {/* Fallback to Firebase user data if API data is not available */}
          {!profile && user && (
            <>
              {renderProfileInfo('Email', user.email)}
              {renderProfileInfo('User ID', user.uid)}
              {renderProfileInfo('Email Verified', user.emailVerified)}
            </>
          )}
        </View>
      </View>

      {/* Refresh Button */}
      <View style={styles.refreshSection}>
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: themeColors.card }]}
          onPress={fetchProfile}
        >
          <Feather name="refresh-cw" size={20} color={themeColors.textPrimary} />
          <Text style={[styles.refreshButtonText, { color: themeColors.textPrimary }]}>
            Refresh Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutSection}>
        <SignOutButton 
          style={styles.signOutButton}
          textStyle={styles.signOutButtonText}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    ...TYPOGRAPHY.H6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    ...TYPOGRAPHY.BODY,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#14B8A6', // This will be updated dynamically
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000', // This will be updated dynamically
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTitle: {
    ...TYPOGRAPHY.H5,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileLabel: {
    ...TYPOGRAPHY.BODY,
  },
  profileValue: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  refreshSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  refreshButtonText: {
    ...TYPOGRAPHY.BUTTON,
    marginLeft: 8,
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  signOutButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  signOutButtonText: {
    ...TYPOGRAPHY.BUTTON,
  },
});

export default ProfileScreen; 