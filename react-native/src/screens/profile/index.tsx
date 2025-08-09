import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setDarkMode } from '@/store/themeSlice';
import { getThemeColors, getBrandColors, COLORS } from '@/config/colors';
import { RefreshUtils } from '@/utils/refreshUtils';
import { ProfileAvatar } from '@/components/shared';
import NotificationSettings from './components/NotificationSettings';
import quotesService, { NotificationPreferences } from '@/services/quotesService';
import { useAuth } from '@/contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    enabled: true,
    frequency: 'daily',
    quietHours: { start: '22:00', end: '08:00' }
  });

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const preferences = await quotesService.getNotificationPreferences();
      setNotificationPreferences(preferences);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const toggleTheme = () => {
    dispatch(setDarkMode(!isDarkMode));
  };

  const toggleNotificationSettings = () => {
    setShowNotificationSettings(!showNotificationSettings);
  };

  const handleNotificationPreferenceChange = async (preferences: NotificationPreferences) => {
    try {
      setNotificationPreferences(preferences);
      await quotesService.setNotificationPreferences(preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing profile data...');
      
      const result = await RefreshUtils.refreshProfileScreen();
      
      if (result.success) {
        console.log('✅ Profile refreshed successfully');
        // Reload local state
        await loadNotificationPreferences();
      } else {
        console.warn('⚠️ Some items failed to refresh:', result.errors);
      }
      
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
          colors={['#14B8A6']} // Primary brand color
        />
      }
    >
      <View style={styles.header}>
        <ProfileAvatar 
          size={80} 
          showEditButton={true}
          onPress={() => {
            Alert.alert(
              'Edit Profile Picture',
              'Profile picture editing will be available soon! You can update your profile picture in your account settings.',
              [{ text: 'OK' }]
            );
          }}
        />
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>Profile</Text>
          {refreshing && (
            <View style={styles.refreshIndicator}>
              <ActivityIndicator 
                size="small" 
                color={brandColors.primary}
                style={styles.spinner}
              />
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Manage your app preferences and settings
        </Text>
      </View>

      {/* User Info Section */}
      {user && (
        <View style={styles.userInfoSection}>
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoRow}>
              <Text style={[styles.userInfoLabel, { color: themeColors.textSecondary }]}>
                Name:
              </Text>
              <Text style={[styles.userInfoValue, { color: themeColors.textPrimary }]}>
                {user.displayName || 'Not set'}
              </Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={[styles.userInfoLabel, { color: themeColors.textSecondary }]}>
                Email:
              </Text>
              <Text style={[styles.userInfoValue, { color: themeColors.textPrimary }]}>
                {user.email || 'Not available'}
              </Text>
            </View>
            {user.emailVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Appearance
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
              Dark Mode
            </Text>
            <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
              Switch between light and dark themes
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: themeColors.border, true: brandColors.primary }}
            thumbColor={isDarkMode ? COLORS.WHITE : themeColors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Notifications
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
              Push Notifications
            </Text>
            <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
              {notificationPreferences.enabled 
                ? `Enabled - ${notificationPreferences.frequency} updates`
                : 'Disabled'
              }
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: brandColors.primary }]}
            onPress={toggleNotificationSettings}
          >
            <Text style={styles.settingsButtonText}>Configure</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showNotificationSettings && (
        <View style={styles.notificationSettingsContainer}>
          <NotificationSettings />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          About
        </Text>
        
        <View style={styles.aboutItem}>
          <Text style={[styles.aboutLabel, { color: themeColors.textPrimary }]}>App Version</Text>
          <Text style={[styles.aboutValue, { color: themeColors.textSecondary }]}>1.0.0</Text>
        </View>
        
        <View style={styles.aboutItem}>
          <Text style={[styles.aboutLabel, { color: themeColors.textPrimary }]}>Build</Text>
          <Text style={[styles.aboutValue, { color: themeColors.textSecondary }]}>2024.1</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  refreshIndicator: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  spinner: {
    width: 20,
    height: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  userInfoSection: {
    marginBottom: 24,
  },
  userInfoCard: {
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  verifiedBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  verifiedText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationSettingsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.03)',
    borderRadius: 12,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  aboutLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 14,
  },
});

export default ProfileScreen; 