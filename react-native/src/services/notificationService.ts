import { Alert, Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { getAuth } from '@react-native-firebase/auth';
import { API_CONFIG } from '@/config/api';
import quotesService, { Quote, NotificationPreferences } from './quotesService';

// In-memory storage for notifications - no AsyncStorage dependency
const fallbackNotificationStorage: { [key: string]: string } = {};

// Safe storage operations using only in-memory storage
const safeNotificationSetItem = async (key: string, value: string): Promise<void> => {
  try {
    fallbackNotificationStorage[key] = value;
    console.log(`✅ Notification stored ${key}:`, value.substring(0, 30) + '...');
  } catch (error) {
    console.error('Notification storage set error:', error);
    fallbackNotificationStorage[key] = value;
  }
};

const safeNotificationGetItem = async (key: string): Promise<string | null> => {
  try {
    return fallbackNotificationStorage[key] || null;
  } catch (error) {
    console.error('Notification storage get error:', error);
    return fallbackNotificationStorage[key] || null;
  }
};

// Notification storage keys
const NOTIFICATION_STORAGE_KEYS = {
  NOTIFICATION_PERMISSION: 'notification_permission',
  LAST_NOTIFICATION_TIME: 'last_notification_time',
  NOTIFICATION_SCHEDULE: 'notification_schedule',
  FCM_TOKEN: 'fcm_token'
};

export interface NotificationData {
  quote: Quote;
  type: 'daily_quote' | 'hourly_quote' | '5min_quote';
  timestamp: number;
}

// Server API response types
interface ServerNotificationPreferences {
  enabled: boolean;
  frequency: string;
  quietHours: {
    start: string;
    end: string;
  };
  lastNotificationSent: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdatePreferencesRequest {
  enabled: boolean;
  frequency: string;
  quietHours: {
    start: string;
    end: string;
  };
}

class NotificationService {
  private fcmToken: string | null = null;
  private backgroundTaskId: NodeJS.Timeout | null = null;
  private isSimulator: boolean = false;

  constructor() {
    this.checkIfSimulator();
    this.initializeFCM();
  }

  private async checkIfSimulator() {
    try {
      // Check if we're on iOS Simulator
      if (Platform.OS === 'ios') {
        try {
          await fetch('http://localhost:8081/status');
          this.isSimulator = true;
          console.log('📱 iOS Simulator detected');
        } catch {
          // Metro bundler not running, but could still be simulator
          this.isSimulator = false;
          console.log('📱 iOS Device or Simulator (Metro not accessible)');
        }
      } else {
        this.isSimulator = false;
      }
    } catch {
      this.isSimulator = false;
      console.log('📱 Device detection failed, assuming device');
    }
  }

  private async initializeFCM() {
    try {
      if (this.isSimulator) {
        console.log('📱 iOS Simulator - FCM not available');
        return;
      }

      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted');
        await this.getFCMToken();
      } else {
        console.log('❌ Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing FCM:', error);
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      if (this.isSimulator) {
        console.log('📱 iOS Simulator - skipping FCM token');
        return null;
      }

      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
        
        // Store token locally
        await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.FCM_TOKEN, token);
        
        // Send token to server
        await this.sendTokenToServer(token);
        
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  private async sendTokenToServer(token: string) {
    try {
      // Get current user ID from auth context
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user?.uid || 'unknown-user';
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notification/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          Token: token,
          Platform: Platform.OS,
          UserId: userId
        })
      });

      if (response.ok) {
        console.log('✅ FCM token sent to server');
      } else {
        console.warn('⚠️ Failed to send FCM token to server');
      }
    } catch (error) {
      console.error('Error sending FCM token to server:', error);
    }
  }

  private async getAuthToken(): Promise<string> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return token;
      }
      throw new Error('No authenticated user found');
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Authentication token not available');
    }
  }

  // Check if notifications are enabled
  async hasPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        try {
          const authStatus = await messaging().hasPermission();
          const hasPermission = authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
                               authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(hasPermission));
          console.log('🔍 Current iOS permissions:', authStatus);
          return hasPermission;
        } catch (error) {
          console.warn('⚠️ Firebase messaging not available, using stored value:', error);
          const permission = await safeNotificationGetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION);
          return permission ? JSON.parse(permission) : true; // Default to true
        }
      } else {
        // For Android, check if we have permission
        if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(granted));
          console.log('🔍 Current Android permissions:', granted);
          return granted;
        } else {
          // For older Android versions, check stored permission or default to true
          const permission = await safeNotificationGetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION);
          return permission ? JSON.parse(permission) : true;
        }
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  // Start quote scheduler - now uses server-side scheduling instead of client-side intervals
  async startQuoteScheduler(): Promise<void> {
    try {
      // Clear existing scheduler
      if (this.backgroundTaskId) {
        clearInterval(this.backgroundTaskId);
        this.backgroundTaskId = null;
      }

      // Get notification preferences
      const preferences = await quotesService.getNotificationPreferences();
      
      if (!preferences.enabled) {
        console.log('⚠️ Push notifications disabled by user');
        return;
      }

      // Check if we're on iOS Simulator
      if (this.isSimulator) {
        console.log('📱 iOS Simulator detected - server scheduling not available');
        return;
      }

      // Check permission first
      const hasPermission = await this.hasPermission();
      if (!hasPermission) {
        console.log('⚠️ No notification permission - cannot schedule');
        return;
      }

      console.log('✅ Notification scheduler started - using server-side scheduling');
      console.log('📱 Background notifications will be handled by server');
      console.log('📱 Check notification center for scheduled notifications');
      
      // Send initial notification for testing
      await this.sendImmediateTestNotification();
    } catch (error) {
      console.error('Error starting quote scheduler:', error);
    }
  }

  // Send immediate test notification
  private async sendImmediateTestNotification(): Promise<void> {
    try {
      if (this.isSimulator) {
        console.log('📱 iOS Simulator - skipping test notification');
        return;
      }

      const quote = await quotesService.getCurrentQuote();
      await this.sendQuoteNotification(quote, 'daily_quote');
      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  // Check and send quote notification if needed
  private async checkAndSendQuoteNotification(): Promise<void> {
    try {
      const preferences = await quotesService.getNotificationPreferences();
      
      if (!preferences.enabled) return;

      // Check if we're on iOS Simulator
      if (this.isSimulator) {
        console.log('📱 iOS Simulator detected - skipping FCM notification');
        return;
      }

      // Check permission first
      const hasPermission = await this.hasPermission();
      if (!hasPermission) {
        console.log('⚠️ No notification permission - skipping');
        return;
      }

      // Check if it's quiet hours
      if (quotesService.isQuietHours(preferences)) {
        console.log('🌙 Skipping notification: quiet hours');
        return;
      }

      // Check if enough time has passed since last notification
      const shouldSend = await this.shouldSendNotification(preferences);
      if (!shouldSend) return;

      // Get updated quote
      const quote = await quotesService.updateQuoteIfNeeded();
      
      // Send the notification
      const notificationType = preferences.frequency === 'daily' ? 'daily_quote' : 
                              preferences.frequency === '5min' ? '5min_quote' : 'hourly_quote';
      await this.sendQuoteNotification(quote, notificationType);
      
      // Update last notification time
      await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.LAST_NOTIFICATION_TIME, new Date().toISOString());
      
      console.log('✅ Push notification sent!');
    } catch (error) {
      console.error('Error checking and sending quote notification:', error);
    }
  }

  // Check if we should send notification based on frequency
  private async shouldSendNotification(preferences: NotificationPreferences): Promise<boolean> {
    try {
      const lastNotificationTime = await safeNotificationGetItem(NOTIFICATION_STORAGE_KEYS.LAST_NOTIFICATION_TIME);
      
      if (!lastNotificationTime) {
        console.log('🆕 First notification - sending');
        return true;
      }

      const lastTime = new Date(lastNotificationTime);
      const now = new Date();
      const timeDiff = now.getTime() - lastTime.getTime();
      
      switch (preferences.frequency) {
        case '5min': {
          const fiveMinPassed = timeDiff >= 5 * 60 * 1000; // 5 minutes
          if (fiveMinPassed) console.log('⚡ 5-minute notification due');
          return fiveMinPassed;
        }
        case 'hourly': {
          const hoursPassed = timeDiff >= 60 * 60 * 1000; // 1 hour
          if (hoursPassed) console.log('⏰ Hourly notification due');
          return hoursPassed;
        }
        case 'twice-daily': {
          const twiceDailyPassed = timeDiff >= 12 * 60 * 60 * 1000; // 12 hours
          if (twiceDailyPassed) console.log('🌅 Twice-daily notification due');
          return twiceDailyPassed;
        }
        case 'daily': {
          const dailyPassed = timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
          if (dailyPassed) console.log('🌙 Daily notification due');
          return dailyPassed;
        }
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking notification timing:', error);
      return false;
    }
  }

  async sendQuoteNotification(quote: Quote, type: 'daily_quote' | 'hourly_quote' | '5min_quote'): Promise<void> {
    try {
      if (this.isSimulator) {
        console.log('📱 iOS Simulator - skipping FCM notification');
        return;
      }

      const title = '🧘 Daily Wisdom';
      const body = `"${quote.text}" - ${quote.author}`;
      
      console.log(`🔔 Sending notification: ${title}`);
      console.log(`📝 Body: ${body}`);
      
      // Force FCM token generation if not available
      if (!this.fcmToken) {
        console.log('🔑 No FCM token available, forcing token generation...');
        try {
          await messaging().registerDeviceForRemoteMessages();
          const token = await messaging().getToken();
          if (token) {
            this.fcmToken = token;
            console.log('✅ FCM token generated:', token.substring(0, 20) + '...');
          } else {
            throw new Error('Failed to get FCM token - check Firebase configuration');
          }
        } catch (tokenError: unknown) {
          console.error('❌ FCM token generation failed:', tokenError);

          // Show alert for debugging
          Alert.alert(
            '❌ FCM Token Generation Failed',
            `FCM token generation failed:\n\n${tokenError && typeof tokenError === 'object' && 'message' in tokenError ? String(tokenError.message) : 'Unknown error'}\n\nFCM token is required for push notifications. Check Firebase setup.`,
            [{ text: 'OK' }]
          );

          throw new Error('FCM token is required for push notifications. Check Firebase setup.');
        }
      }
      
      console.log(`🔔 Sending FCM notification: ${title}`);
      
      // Send notification via server API
      await this.sendFCMNotification({
        title,
        body,
        data: {
          quote: JSON.stringify(quote),
          type: type,
          timestamp: Date.now().toString()
        }
      });
      
      console.log('✅ FCM notification sent via server');
      
      // Always update the current quote in the app
      await quotesService.setCurrentQuote(quote);
    } catch (error) {
      console.error('Error sending quote notification:', error);
      throw error;
    }
  }

  private async sendFCMNotification(notification: {
    title: string;
    body: string;
    data: Record<string, string>;
  }): Promise<void> {
    try {
      if (!this.fcmToken) {
        throw new Error('No FCM token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notification/send-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          UserTokens: [this.fcmToken],
          Quote: {
            Text: notification.data.quote,
            Author: 'Guras',
            Category: 'daily'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Server notification response:', result);
    } catch (error) {
      console.error('Error sending FCM notification via server:', error);
      throw error;
    }
  }

  // Sync user preferences with server
  async syncPreferencesWithServer(): Promise<void> {
    try {
      const localPreferences = await quotesService.getNotificationPreferences();
      
      // Convert local frequency to server format
      const serverFrequency = this.convertFrequencyToServer(localPreferences.frequency);
      
      const request: UpdatePreferencesRequest = {
        enabled: localPreferences.enabled,
        frequency: serverFrequency,
        quietHours: {
          start: localPreferences.quietHours.start,
          end: localPreferences.quietHours.end
        }
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/usernotificationpreferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          Enabled: request.enabled,
          Frequency: request.frequency,
          QuietHours: {
            Start: request.quietHours.start,
            End: request.quietHours.end
          }
        })
      });

      if (response.ok) {
        const serverPreferences: ServerNotificationPreferences = await response.json();
        console.log('✅ Preferences synced with server:', serverPreferences);
        
        // Update local preferences with server data
        const updatedLocalPreferences: NotificationPreferences = {
          enabled: serverPreferences.enabled,
          frequency: this.convertFrequencyFromServer(serverPreferences.frequency),
          quietHours: {
            start: serverPreferences.quietHours.start,
            end: serverPreferences.quietHours.end
          }
        };
        
        await quotesService.setNotificationPreferences(updatedLocalPreferences);
      } else {
        console.warn('⚠️ Failed to sync preferences with server');
      }
    } catch (error) {
      console.error('Error syncing preferences with server:', error);
    }
  }

  // Load user preferences from server
  async loadPreferencesFromServer(): Promise<NotificationPreferences | null> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/usernotificationpreferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const serverPreferences: ServerNotificationPreferences = await response.json();
        console.log('✅ Loaded preferences from server:', serverPreferences);
        
        // Convert server format to local format
        const localPreferences: NotificationPreferences = {
          enabled: serverPreferences.enabled,
          frequency: this.convertFrequencyFromServer(serverPreferences.frequency),
          quietHours: {
            start: serverPreferences.quietHours.start,
            end: serverPreferences.quietHours.end
          }
        };
        
        // Update local storage
        await quotesService.setNotificationPreferences(localPreferences);
        
        return localPreferences;
      } else {
        console.warn('⚠️ Failed to load preferences from server');
        return null;
      }
    } catch (error) {
      console.error('Error loading preferences from server:', error);
      return null;
    }
  }

  private convertFrequencyToServer(frequency: '5min' | 'hourly' | 'daily' | 'twice-daily'): string {
    switch (frequency) {
      case '5min': return '5min';
      case 'hourly': return 'hourly';
      case 'twice-daily': return 'twice-daily';
      case 'daily': return 'daily';
      default: return 'daily';
    }
  }

  private convertFrequencyFromServer(frequency: string): '5min' | 'hourly' | 'daily' | 'twice-daily' {
    switch (frequency.toLowerCase()) {
      case '5min': return '5min';
      case 'hourly': return 'hourly';
      case 'twice-daily': return 'twice-daily';
      case 'daily': return 'daily';
      default: return 'daily';
    }
  }

  // Update notification preferences and restart scheduler
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await quotesService.setNotificationPreferences(preferences);
      
      // Sync with server
      await this.syncPreferencesWithServer();
      
      // Restart scheduler with new preferences
      await this.startQuoteScheduler();
      
      console.log('✅ Notification preferences updated and scheduler restarted');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  // Get notification status
  async getNotificationStatus(): Promise<{
    hasPermission: boolean;
    isEnabled: boolean;
    preferences: NotificationPreferences;
    lastNotificationTime: string | null;
  }> {
    try {
      const hasPermission = await this.hasPermission();
      const preferences = await quotesService.getNotificationPreferences();
      const lastNotificationTime = await safeNotificationGetItem(NOTIFICATION_STORAGE_KEYS.LAST_NOTIFICATION_TIME);

      return {
        hasPermission,
        isEnabled: preferences.enabled && hasPermission,
        preferences,
        lastNotificationTime
      };
    } catch (error) {
      console.error('Error getting notification status:', error);
      return {
        hasPermission: false,
        isEnabled: false,
        preferences: {
          enabled: true,
          frequency: 'daily',
          quietHours: { start: '22:00', end: '08:00' }
        },
        lastNotificationTime: null
      };
    }
  }

  // Send test notification
  async sendTestNotification(): Promise<void> {
    try {
      console.log('🔔 Starting test notification...');
      
      if (this.isSimulator) {
        console.log('📱 iOS Simulator detected - FCM notifications not available');
        Alert.alert(
          '📱 iOS Simulator',
          'Push notifications are not available in iOS Simulator. Please test on a physical device.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Check permission first
      const hasPermission = await this.hasPermission();
      if (!hasPermission) {
        console.log('❌ No notification permission');
        Alert.alert(
          '❌ Permission Required',
          'Please grant notification permission to send test notifications.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Check if FCM token is available
      if (!this.fcmToken) {
        console.log('🔑 No FCM token available, generating...');
        try {
          await this.getFCMToken();
          if (!this.fcmToken) {
            Alert.alert(
              '🔑 FCM Token Error',
              'Failed to generate FCM token. This might be due to:\n\n• Firebase configuration issue\n• Network connectivity problem\n• App not properly registered with Firebase\n\nPlease check your internet connection and try again.',
              [{ text: 'OK' }]
            );
            return;
          }
        } catch (tokenError) {
          Alert.alert(
            '🔑 FCM Token Generation Failed',
            `Failed to generate FCM token:\n\n${tokenError && typeof tokenError === 'object' && 'message' in tokenError ? String(tokenError.message) : 'Unknown error'}\n\nThis might be due to:\n• Firebase configuration issue\n• Network connectivity problem\n• App not properly registered with Firebase`,
            [{ text: 'OK' }]
          );
          return;
        }
      }

      console.log('✅ FCM token available:', this.fcmToken.substring(0, 20) + '...');
      
      // Load quote
      let quote;
      try {
        quote = await quotesService.getCurrentQuote();
        console.log('📝 Quote loaded:', quote.text.substring(0, 50) + '...');
      } catch (quoteError) {
        Alert.alert(
          '📝 Quote Loading Error',
          `Failed to load quote for notification:\n\n${quoteError && typeof quoteError === 'object' && 'message' in quoteError ? String(quoteError.message) : 'Unknown error'}\n\nThis might be due to:\n• Network connectivity issue\n• Server not responding\n• Quote service configuration problem`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Send the notification
      try {
        await this.sendQuoteNotification(quote, 'daily_quote');
        console.log('✅ Test notification sent successfully');
        
        // Show success message
        Alert.alert(
          '✅ Success!',
          'Test notification sent successfully!\n\nIf you don\'t see it:\n• Check your notification center\n• Ensure Do Not Disturb is off\n• Check notification settings in iOS Settings',
          [{ text: 'OK' }]
        );
      } catch (notificationError) {
        console.error('❌ Error sending notification:', notificationError);
        
        // Show detailed error message
        let errorMessage = 'Unknown error occurred while sending notification.';
        
        if (notificationError && typeof notificationError === 'object' && 'message' in notificationError) {
          const errorMsg = String(notificationError.message);
          if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
            errorMessage = 'Authentication failed. Please sign in again and try.';
          } else if (errorMsg.includes('500') || errorMsg.includes('Internal Server Error')) {
            errorMessage = 'Server error occurred. Please try again later.';
          } else if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection.';
          } else {
            errorMessage = errorMsg;
          }
        }
        
        Alert.alert(
          '❌ Notification Failed',
          `Failed to send test notification:\n\n${errorMessage}\n\nThis might be due to:\n• Network connectivity issue\n• Server not responding\n• Authentication problem\n• FCM configuration issue`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      
      // Show generic error message
      Alert.alert(
        '❌ Unexpected Error',
        `An unexpected error occurred:\n\n${error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`,
        [{ text: 'OK' }]
      );
      
      throw error;
    }
  }

  // Cleanup
  cleanup(): void {
    if (this.backgroundTaskId) {
      clearInterval(this.backgroundTaskId);
      this.backgroundTaskId = null;
    }
  }
}

// Export singleton instance
export default new NotificationService(); 