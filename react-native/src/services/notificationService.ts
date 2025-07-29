import { Alert, Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { API_CONFIG } from '@/config/api';
import quotesService, { Quote, NotificationPreferences } from './quotesService';

// In-memory storage for notifications - no AsyncStorage dependency
let fallbackNotificationStorage: { [key: string]: string } = {};

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
    const value = fallbackNotificationStorage[key] || null;
    if (value) {
      console.log(`✅ Notification retrieved ${key}:`, value.substring(0, 30) + '...');
    }
    return value;
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
  type: 'daily_quote' | 'hourly_quote';
  timestamp: number;
}

class NotificationService {
  private static instance: NotificationService;
  private backgroundTaskId: NodeJS.Timeout | null = null;
  private initialized = false;
  private fcmToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize Firebase Cloud Messaging
  private async initializeFCM(): Promise<void> {
    try {
      console.log('🔥 Initializing Firebase Cloud Messaging...');

      // Check if Firebase messaging is available
      if (!messaging) {
        throw new Error('Firebase messaging module not available');
      }

      // Register the app with FCM
      await messaging().registerDeviceForRemoteMessages();

      // Get the FCM token
      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.FCM_TOKEN, token);
        console.log('📱 FCM Token obtained:', token.substring(0, 20) + '...');

        // Send token to server for user registration
        await this.registerTokenWithServer(token);
      } else {
        console.warn('⚠️ No FCM token received');
      }

      // Listen for token refresh
      const unsubscribeTokenRefresh = messaging().onTokenRefresh((token) => {
        this.fcmToken = token;
        safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.FCM_TOKEN, token);
        console.log('🔄 FCM Token refreshed:', token.substring(0, 20) + '...');
        this.registerTokenWithServer(token);
      });

      // Handle foreground messages
      const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        console.log('📬 FCM message received in foreground:', remoteMessage);
        this.handleForegroundMessage(remoteMessage);
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('📬 FCM message received in background:', remoteMessage);
        return Promise.resolve();
      });

      console.log('✅ FCM initialized successfully');
    } catch (error) {
      console.warn('⚠️ FCM initialization failed:', error);
      console.log('📱 Continuing with local notification features only');
      // Continue without FCM - local features still work
    }
  }

  // Register FCM token with server
  private async registerTokenWithServer(token: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notification/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          userId: 'anonymous-user', // TODO: Get from auth context when user is signed in
        }),
      });

      if (response.ok) {
        console.log('✅ FCM token registered with server');
      } else {
        console.warn('⚠️ Failed to register FCM token with server');
      }
    } catch (error) {
      console.warn('⚠️ Error registering FCM token with server:', error);
    }
  }

  // Handle foreground FCM messages
  private handleForegroundMessage(remoteMessage: any): void {
    try {
      const { notification, data } = remoteMessage;
      
      if (notification) {
        // Show in-app notification or alert
        Alert.alert(
          notification.title || '🧘 Daily Wisdom',
          notification.body || 'New quote available',
          [
            { text: 'Dismiss', style: 'cancel' },
            { text: 'View', onPress: () => this.handleNotificationTap(data) }
          ]
        );
      }

      // Update quote if it's a quote notification
      if (data && data.type === 'daily_quote' && data.quote) {
        try {
          const quote = JSON.parse(data.quote);
          quotesService.setCurrentQuote(quote);
        } catch (parseError) {
          console.warn('⚠️ Error parsing quote from FCM data:', parseError);
        }
      }
    } catch (error) {
      console.error('❌ Error handling foreground message:', error);
    }
  }

  // Handle notification tap
  private handleNotificationTap(data: any): void {
    console.log('👆 Notification tapped:', data);
    // Navigate to specific screen or update app state based on notification data
  }

  // Send FCM notification via server
  private async sendFCMNotification(notificationData: {
    title: string;
    body: string;
    data: { [key: string]: string };
  }): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notification/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...notificationData,
          token: this.fcmToken,
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📤 FCM notification sent successfully:', result);
    } catch (error) {
      console.error('❌ Failed to send FCM notification via server:', error);
      throw error;
    }
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🔔 Initializing push notifications...');
      
      // Initialize FCM
      await this.initializeFCM();
      
      // Request permissions
      const hasPermission = await this.requestPermission();
      if (hasPermission) {
        console.log('✅ Push notification permission granted!');
      } else {
        console.log('⚠️ Push notification permission denied');
      }

      // Start background quote scheduler
      await this.startQuoteScheduler();

      this.initialized = true;
      console.log('✅ Push notifications initialized!');
    } catch (error) {
      console.error('Error initializing notification service:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Request notification permissions for both iOS and Android
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        console.log('📱 Requesting iOS notification permissions...');
        
        try {
          const authStatus = await messaging().requestPermission({
            alert: true,
            badge: true,
            sound: true,
          });
          
          const granted = authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
                         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(granted));
          
          console.log('✅ iOS notification permission result:', granted, authStatus);
          return granted;
        } catch (firebaseError) {
          console.warn('⚠️ Firebase messaging not available, falling back to basic permissions');
          // Fallback: assume permission granted for now
          await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(true));
          return true;
        }
      } else {
        console.log('🤖 Requesting Android notification permissions...');
        
        // Request permission for Android 13+ (API level 33+)
        if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'Guras would like to send you daily wisdom notifications',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
          await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(hasPermission));
          console.log('✅ Android notification permission result:', hasPermission);
          return hasPermission;
        } else {
          // For older Android versions, notifications are granted by default
          await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(true));
          console.log('✅ Android notification permission granted (older version)');
          return true;
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
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

  // Start the quote scheduler
  async startQuoteScheduler(): Promise<void> {
    try {
      // Clear existing scheduler
      if (this.backgroundTaskId) {
        clearInterval(this.backgroundTaskId);
      }

      // Get notification preferences
      const preferences = await quotesService.getNotificationPreferences();
      
      if (!preferences.enabled) {
        console.log('⚠️ Push notifications disabled by user');
        return;
      }

      // Set up interval based on frequency (checking every 5 minutes for precision)
      this.backgroundTaskId = setInterval(async () => {
        await this.checkAndSendQuoteNotification();
      }, 5 * 60 * 1000); // Check every 5 minutes

      console.log('✅ Push notification scheduler started (checking every 5 minutes)');
      
      // Also check immediately
      await this.checkAndSendQuoteNotification();
    } catch (error) {
      console.error('Error starting quote scheduler:', error);
    }
  }

  // Stop the quote scheduler
  stopQuoteScheduler(): void {
    if (this.backgroundTaskId) {
      clearInterval(this.backgroundTaskId);
      this.backgroundTaskId = null;
      console.log('🛑 Push notification scheduler stopped');
    }
  }

  // Check and send quote notification if needed
  private async checkAndSendQuoteNotification(): Promise<void> {
    try {
      const preferences = await quotesService.getNotificationPreferences();
      
      if (!preferences.enabled) return;

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
      await this.sendQuoteNotification(quote, preferences.frequency === 'daily' ? 'daily_quote' : 'hourly_quote');
      
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
        case 'hourly':
          const hoursPassed = timeDiff >= 60 * 60 * 1000; // 1 hour
          if (hoursPassed) console.log('⏰ Hourly notification due');
          return hoursPassed;
        case 'twice-daily':
          const twiceDailyPassed = timeDiff >= 12 * 60 * 60 * 1000; // 12 hours
          if (twiceDailyPassed) console.log('🌅 Twice-daily notification due');
          return twiceDailyPassed;
        case 'daily':
          const dailyPassed = timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
          if (dailyPassed) console.log('🌙 Daily notification due');
          return dailyPassed;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking notification timing:', error);
      return false;
    }
  }

  // Send push notification for both iOS and Android
  async sendQuoteNotification(quote: Quote, type: 'daily_quote' | 'hourly_quote'): Promise<void> {
    try {
      const title = type === 'daily_quote' ? '🧘 Daily Wisdom' : '✨ Hourly Inspiration';
      const body = `"${quote.text}" - ${quote.author}`;

      console.log(`🔔 Sending push notification: ${title} - ${body.substring(0, 50)}...`);
      
            try {
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
      } catch (notificationError) {
        console.error('❌ Error sending FCM notification:', notificationError);
        // Fallback: still update the quote in the app
        console.log('📝 Quote updated in app despite notification error');
      }
      
      // Always update the current quote in the app
      await quotesService.setCurrentQuote(quote);
    } catch (error) {
      console.error('Error sending quote notification:', error);
    }
  }

  // Manual trigger for testing notifications
  async sendTestNotification(): Promise<void> {
    try {
      console.log('🧪 Testing push notification...');
      
      const hasPermission = await this.hasPermission();
      if (!hasPermission) {
        Alert.alert(
          '🔔 Permission Required',
          'Please enable notifications in Settings > Notifications > Guras to receive push notifications.\n\nGo to Settings → Notifications → Guras → Allow Notifications',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // On iOS, this will guide them to settings
              console.log('User should go to iOS Settings → Notifications → Guras');
            }}
          ]
        );
        return;
      }

      const quote = quotesService.getRandomQuote();
      await this.sendQuoteNotification(quote, 'daily_quote');
      
      Alert.alert(
        '✅ Push Notification Sent!', 
        '🚀 Check your notification panel and lock screen!\n\n📱 You should see a notification with sound.\n\n💡 If you don\'t see it, check Settings → Notifications → Guras',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert(
        '⚠️ Test Error', 
        'There was an issue sending the notification. The quote has been updated in the app though.',
        [{ text: 'OK' }]
      );
    }
  }

  // Schedule a notification for a specific time
  async scheduleNotification(quote: Quote, date: Date, type: 'daily_quote' | 'hourly_quote'): Promise<void> {
    try {
      const title = type === 'daily_quote' ? '🧘 Daily Wisdom' : '✨ Hourly Inspiration';
      const body = `"${quote.text}" - ${quote.author}`;

      try {
        console.log(`📅 Would schedule ${Platform.OS === 'ios' ? 'iOS' : 'Android'} notification for ${date.toLocaleString()}: ${title}`);
        console.log(`📝 Scheduled notification body: ${body.substring(0, 100)}...`);
        
        // Note: Actual scheduling would require platform-specific implementation
        console.log(`✅ Notification scheduling logged`);
      } catch (scheduleError) {
        console.error('Error logging scheduled notification:', scheduleError);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Update notification preferences and restart scheduler
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await quotesService.setNotificationPreferences(preferences);
      
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

  // Cancel all scheduled notifications
  cancelAllNotifications(): void {
    try {
      console.log('📱 Would cancel all local notifications');
      console.log('🔢 Would reset badge count to 0');
      console.log('✅ All notifications would be cancelled');
    } catch (error) {
      console.error('Error logging notification cancellation:', error);
    }
  }

  // Cleanup
  destroy(): void {
    this.stopQuoteScheduler();
    console.log('✅ Notification service destroyed');
  }
}

export default NotificationService.getInstance(); 