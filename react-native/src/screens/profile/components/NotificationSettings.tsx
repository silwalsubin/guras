import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setNotificationPreferences } from '@/store/quotesSlice';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { RefreshUtils } from '@/utils/refreshUtils';
import quotesService, { NotificationPreferences } from '@/services/quotesService';
import notificationService from '@/services/notificationService';

const NotificationSettings: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    frequency: 'daily',
    quietHours: { start: '22:00', end: '08:00' }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPermission();
  }, []);

  const loadPreferences = async () => {
    try {
      // Try to load from server first
      const serverPreferences = await notificationService.loadPreferencesFromServer();
      if (serverPreferences) {
        setPreferences(serverPreferences);
        dispatch(setNotificationPreferences(serverPreferences));
      } else {
        // Fallback to local preferences
        const localPreferences = await quotesService.getNotificationPreferences();
        setPreferences(localPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Fallback to local preferences
      const localPreferences = await quotesService.getNotificationPreferences();
      setPreferences(localPreferences);
    }
  };

  const checkPermission = async () => {
    try {
      const permission = await notificationService.hasPermission();
      setHasPermission(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing notification settings...');
      
      const result = await RefreshUtils.refreshNotificationSettings();
      
      if (result.success) {
        console.log('✅ Notification settings refreshed successfully');
        // Reload local state
        await loadPreferences();
        await checkPermission();
      } else {
        console.warn('⚠️ Some items failed to refresh:', result.errors);
      }
      
    } catch (error) {
      console.error('Error refreshing notification settings:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      
      const updatedPreferences = { ...preferences, enabled };
      setPreferences(updatedPreferences);
      
      // Update local storage
      await quotesService.setNotificationPreferences(updatedPreferences);
      
      // Update Redux store
      dispatch(setNotificationPreferences(updatedPreferences));
      
      // Sync with server
      await notificationService.syncPreferencesWithServer();
      
      // Restart notification scheduler
      await notificationService.startQuoteScheduler();
      
      if (enabled) {
        Alert.alert(
          '✅ Notifications Enabled',
          'Daily wisdom notifications are now enabled. You\'ll receive quotes based on your frequency setting.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '🔕 Notifications Disabled',
          'Daily wisdom notifications are now disabled.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrequencyChange = async (frequency: string) => {
    try {
      setIsLoading(true);
      
      const updatedPreferences = { ...preferences, frequency };
      setPreferences(updatedPreferences);
      
      // Update local storage
      await quotesService.setNotificationPreferences(updatedPreferences);
      
      // Update Redux store
      dispatch(setNotificationPreferences(updatedPreferences));
      
      // Sync with server
      await notificationService.syncPreferencesWithServer();
      
      // Restart notification scheduler
      await notificationService.startQuoteScheduler();
      
      Alert.alert(
        '✅ Frequency Updated',
        `Notifications will now be sent ${getFrequencyDescription(frequency)}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating frequency:', error);
      Alert.alert('Error', 'Failed to update notification frequency');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuietHoursChange = async (start: string, end: string) => {
    try {
      setIsLoading(true);
      
      const updatedPreferences = { ...preferences, quietHours: { start, end } };
      setPreferences(updatedPreferences);
      
      // Update local storage
      await quotesService.setNotificationPreferences(updatedPreferences);
      
      // Update Redux store
      dispatch(setNotificationPreferences(updatedPreferences));
      
      // Sync with server
      await notificationService.syncPreferencesWithServer();
      
      Alert.alert(
        '✅ Quiet Hours Updated',
        `Quiet hours are now set from ${start} to ${end}. No notifications will be sent during this time.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating quiet hours:', error);
      Alert.alert('Error', 'Failed to update quiet hours');
    } finally {
      setIsLoading(false);
    }
  };

  const getFrequencyDescription = (frequency: string): string => {
    switch (frequency) {
      case '5min': return 'every 5 minutes';
      case 'hourly': return 'every hour';
      case 'twice-daily': return 'twice daily';
      case 'daily': return 'once daily';
      default: return 'once daily';
    }
  };

  const getFrequencyLabel = (frequency: string): string => {
    switch (frequency) {
      case '5min': return 'Every 5 Minutes';
      case 'hourly': return 'Every Hour';
      case 'twice-daily': return 'Twice Daily';
      case 'daily': return 'Daily';
      default: return 'Daily';
    }
  };

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      
      // Start notification service to request permission
      await notificationService.startQuoteScheduler();
      
      // Check permission again
      await checkPermission();
      
      if (hasPermission) {
        Alert.alert(
          '✅ Permission Granted',
          'Notification permission has been granted. You can now enable notifications.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Permission Denied',
          'Notification permission was denied. Please enable notifications in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request notification permission');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      setIsLoading(true);
      
      if (!hasPermission) {
        Alert.alert('❌ No Permission', 'Please grant notification permission first.');
        return;
      }
      
      if (!preferences.enabled) {
        Alert.alert('❌ Notifications Disabled', 'Please enable notifications first.');
        return;
      }
      
      await notificationService.sendTestNotification();
      
      Alert.alert(
        '✅ Test Sent',
        'Test notification has been sent! Check your notification center.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Notification Permission Required
        </Text>
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          To receive daily wisdom notifications, please grant notification permission.
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: brandColors.primary }]}
          onPress={requestPermission}
          disabled={isLoading}
        >
          <Text style={styles.permissionButtonText}>
            {isLoading ? 'Requesting...' : 'Grant Permission'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Push Notifications
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
              Enable Notifications
            </Text>
            <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
              Receive daily wisdom quotes via push notifications
            </Text>
          </View>
          <Switch
            value={preferences.enabled}
            onValueChange={handleToggleNotifications}
            disabled={isLoading}
            trackColor={{ false: themeColors.border, true: brandColors.primary }}
            thumbColor={preferences.enabled ? brandColors.white : themeColors.textSecondary}
          />
        </View>
      </View>

      {preferences.enabled && (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Notification Frequency
            </Text>
            
            {['daily', 'twice-daily', 'hourly', '5min'].map((frequency) => (
              <TouchableOpacity
                key={frequency}
                style={[
                  styles.frequencyOption,
                  {
                    backgroundColor: preferences.frequency === frequency 
                      ? brandColors.primary 
                      : themeColors.surface,
                    borderColor: preferences.frequency === frequency 
                      ? brandColors.primary 
                      : themeColors.border
                  }
                ]}
                onPress={() => handleFrequencyChange(frequency)}
                disabled={isLoading}
              >
                <Text style={[
                  styles.frequencyText,
                  {
                    color: preferences.frequency === frequency 
                      ? brandColors.white 
                      : themeColors.textPrimary
                  }
                ]}>
                  {getFrequencyLabel(frequency)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Quiet Hours
            </Text>
            <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
              No notifications will be sent during these hours
            </Text>
            
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: themeColors.textSecondary }]}>Start</Text>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
                  onPress={() => {
                    // TODO: Implement time picker
                    Alert.alert('Time Picker', 'Time picker will be implemented here');
                  }}
                >
                  <Text style={[styles.timeButtonText, { color: themeColors.textPrimary }]}>
                    {preferences.quietHours.start}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: themeColors.textSecondary }]}>End</Text>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
                  onPress={() => {
                    // TODO: Implement time picker
                    Alert.alert('Time Picker', 'Time picker will be implemented here');
                  }}
                >
                  <Text style={[styles.timeButtonText, { color: themeColors.textPrimary }]}>
                    {preferences.quietHours.end}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: brandColors.secondary }]}
              onPress={sendTestNotification}
              disabled={isLoading}
            >
              <Text style={styles.testButtonText}>
                {isLoading ? 'Sending...' : 'Send Test Notification'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  frequencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  testButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationSettings; 