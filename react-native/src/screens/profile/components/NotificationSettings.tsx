import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { getThemeColors, getBrandColors } from '../../../config/colors';
import notificationService from '../../../services/notificationService';
import quotesService, { NotificationPreferences } from '../../../services/quotesService';

const NotificationSettings: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    frequency: 'daily',
    quietHours: { start: '22:00', end: '08:00' }
  });
  const [hasPermission, setHasPermission] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const status = await notificationService.getNotificationStatus();
      setPreferences(status.preferences);
      setHasPermission(status.hasPermission);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    try {
      const updatedPreferences = { ...preferences, enabled };
      setPreferences(updatedPreferences);
      await notificationService.updatePreferences(updatedPreferences);
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const changeFrequency = async (frequency: 'hourly' | 'daily' | 'twice-daily') => {
    try {
      const updatedPreferences = { ...preferences, frequency };
      setPreferences(updatedPreferences);
      await notificationService.updatePreferences(updatedPreferences);
    } catch (error) {
      console.error('Error changing frequency:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>Quote Settings</Text>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>Daily Wisdom Settings</Text>
      
      {/* Enable/Disable Toggle */}
      <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Enable Quotes</Text>
          <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
            Automatic quote updates
          </Text>
        </View>
        <Switch
          value={preferences.enabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: themeColors.border, true: brandColors.primary }}
          thumbColor={preferences.enabled ? themeColors.background : themeColors.textSecondary}
        />
      </View>

      {/* Frequency Options */}
      {preferences.enabled && (
        <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Update Frequency</Text>
            <View style={styles.frequencyOptions}>
              {[
                { key: 'hourly', label: 'Every Hour' },
                { key: 'twice-daily', label: 'Twice Daily' },
                { key: 'daily', label: 'Daily' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.frequencyButton,
                    {
                      backgroundColor: preferences.frequency === option.key 
                        ? brandColors.primary 
                        : themeColors.card,
                      borderColor: themeColors.border
                    }
                  ]}
                  onPress={() => changeFrequency(option.key as any)}
                >
                  <Text style={[
                    styles.frequencyText,
                    {
                      color: preferences.frequency === option.key 
                        ? themeColors.background 
                        : themeColors.textPrimary
                    }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Quiet Hours Display */}
      {preferences.enabled && (
        <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: themeColors.text }]}>Quiet Hours</Text>
            <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
              No updates between {preferences.quietHours.start} - {preferences.quietHours.end}
            </Text>
          </View>
        </View>
      )}

      {/* Test Button */}
      {preferences.enabled && (
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: themeColors.primary }]}
          onPress={sendTestNotification}
        >
          <Text style={[styles.testButtonText, { color: themeColors.background }]}>
            Test Quote Update
          </Text>
        </TouchableOpacity>
      )}

      {/* System Info */}
      <View style={styles.systemInfo}>
        <Text style={[styles.systemTitle, { color: themeColors.text }]}>System Info</Text>
        <Text style={[styles.systemDescription, { color: themeColors.textSecondary }]}>
          This is a simplified version that updates quotes automatically based on your selected frequency. 
          The quotes will refresh in the background and update on your Home screen.
        </Text>
        
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: themeColors.textSecondary }]}>Status:</Text>
          <Text style={[styles.statusValue, { color: preferences.enabled ? '#4CAF50' : '#FF9800' }]}>
            {preferences.enabled ? 'Active' : 'Disabled'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: themeColors.textSecondary }]}>Updates:</Text>
          <Text style={[styles.statusValue, { color: themeColors.text }]}>
            {preferences.frequency === 'hourly' ? 'Every hour' : 
             preferences.frequency === 'twice-daily' ? 'Twice per day' : 'Once per day'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  systemInfo: {
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  systemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  systemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationSettings; 