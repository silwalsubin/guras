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
import { getThemeColors, getBrandColors, COLORS, colorUtils } from '@/config/colors';
import { RefreshUtils } from '@/utils/refreshUtils';
import { ProfileAvatar, AchievementBadge } from '@/components/shared';
import NotificationSettings from './components/NotificationSettings';
import SignOutButton from './components/SignOutButton';
import quotesService from '@/services/quotesService';
import notificationService from '@/services/notificationService';
import { NotificationPreferences } from '@/store/quotesSlice';
import { useAuth } from '@/contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    enabled: true,
    frequency: 'daily',
    quietHours: { start: '22:00', end: '08:00' }
  });

  // Mock achievements data
  const mockAchievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first meditation session',
      earned: true,
      icon: 'star',
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: 'Meditate for 7 consecutive days',
      earned: true,
      icon: 'fire',
    },
    {
      id: 3,
      name: 'Mindful Minutes',
      description: 'Complete 100 minutes of meditation',
      earned: true,
      icon: 'clock-o',
    },
    {
      id: 4,
      name: 'Consistency Champion',
      description: 'Maintain a 30-day meditation streak',
      earned: false,
      icon: 'trophy',
      progress: 21,
      target: 30,
    },
    {
      id: 5,
      name: 'Zen Master',
      description: 'Complete 1000 minutes of meditation',
      earned: false,
      icon: 'diamond',
      progress: 892,
      target: 1000,
    },
    {
      id: 6,
      name: 'Early Bird',
      description: 'Complete 10 morning meditation sessions',
      earned: false,
      icon: 'sun-o',
      progress: 3,
      target: 10,
    },
  ];

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const preferences = await notificationService.getNotificationPreferences();
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
      await notificationService.setNotificationPreferences(preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await RefreshUtils.refreshProfileScreen();
      
      if (result.success) {
        // Profile refreshed successfully
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
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? COLORS.WHITE : COLORS.BLACK}
          colors={[COLORS.PRIMARY]} // Primary brand color
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
          Achievements
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
              Meditation Achievements
            </Text>
            <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
              View your earned badges and track progress toward new milestones
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: brandColors.primary }]}
            onPress={() => setShowAchievements(!showAchievements)}
          >
            <Text style={styles.settingsButtonText}>
              {showAchievements ? 'Hide' : 'View'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showAchievements && (
        <View style={styles.achievementsContainer}>
          <Text style={[styles.achievementsTitle, { color: themeColors.textPrimary }]}>
            Your Achievements
          </Text>
          {mockAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              onPress={() => {
                console.log('Achievement pressed:', achievement.name);
              }}
            />
          ))}
        </View>
      )}



      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Account
        </Text>
        
        <SignOutButton />
      </View>

      {/* Bottom padding to prevent content from being hidden by footer */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    // Don't center all content - let individual sections handle their own alignment
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
    width: '100%',
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
    backgroundColor: colorUtils.withOpacity(COLORS.GRAY_500, 0.1),
    borderWidth: 1,
    borderColor: colorUtils.withOpacity(COLORS.GRAY_500, 0.2),
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
    width: '100%',
  },
  userInfoCard: {
    backgroundColor: colorUtils.withOpacity(COLORS.GRAY_500, 0.05),
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
    backgroundColor: COLORS.SUCCESS,
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
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    width: '100%',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colorUtils.withOpacity(COLORS.GRAY_500, 0.05),
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
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  notificationSettingsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colorUtils.withOpacity(COLORS.GRAY_500, 0.03),
    borderRadius: 12,
  },


  achievementsContainer: {
    backgroundColor: colorUtils.withOpacity(COLORS.GRAY_500, 0.05),
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  // Add bottom padding to account for the footer
  bottomPadding: {
    height: 100, // Account for bottom navigation + safe area
  },
});

export default ProfileScreen; 