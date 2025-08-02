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
  type: 'daily_quote' | 'hourly_quote' | '5min_quote';
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
        console.warn('⚠️ Firebase messaging module not available');
        return;
      }

      // Firebase connection check - removed debugging test to prevent initialization errors

      // Check if we're on iOS Simulator
      if (Platform.OS === 'ios') {
        try {
          const DeviceInfo = require('react-native-device-info');
          if (DeviceInfo && typeof DeviceInfo.isSimulator === 'function') {
            const isIOSSimulator = await DeviceInfo.isSimulator();
            if (isIOSSimulator) {
              console.log('📱 iOS Simulator detected - FCM will not work');
              console.log('ℹ️ FCM requires a real device or TestFlight for push notifications');
              return;
            }
          } else {
            console.log('⚠️ DeviceInfo.isSimulator not available, continuing...');
          }
        } catch (error) {
          console.log('Could not check simulator status:', error);
        }
      }

      // Check current permission status
      const currentPermission = await messaging().hasPermission();
      console.log('🔍 Current FCM permission status:', currentPermission);

      // Register the app with FCM - this is critical for APNs token
      let registrationSuccessful = false;
      try {
        console.log('📱 Registering device for remote messages...');
        await messaging().registerDeviceForRemoteMessages();
        console.log('✅ Successfully registered device for remote messages');
        registrationSuccessful = true;
      } catch (registerError) {
        console.error('❌ Failed to register device for remote messages:', registerError);
        console.error('🔴 Registration error details:', JSON.stringify(registerError, null, 2));
        
        // Check if it's already registered
        try {
          const isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;
          console.log('📱 Device already registered for remote messages:', isRegistered);
          if (isRegistered) {
            registrationSuccessful = true;
          }
        } catch (checkError) {
          console.warn('⚠️ Could not check registration status:', checkError);
        }
        
        if (!registrationSuccessful) {
          console.error('🔴 CRITICAL: Device registration failed - APNs token not available');
          console.error('🔴 This will prevent FCM token generation');
          return; // Don't continue if registration failed
        }
      }

      // Wait a moment for APNs token to be properly set
      if (registrationSuccessful) {
        console.log('⏳ Waiting for APNs token to be set...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Get the FCM token - retry multiple times if needed
      let token = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!token && attempts < maxAttempts) {
        attempts++;
        console.log(`🔑 Attempt ${attempts}/${maxAttempts}: Requesting FCM token...`);
        
        try {
          token = await messaging().getToken();
          if (token) {
            this.fcmToken = token;
            await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.FCM_TOKEN, token);
            console.log('📱 FCM Token obtained:', token.substring(0, 20) + '...');

            // Send token to server for user registration
            await this.registerTokenWithServer(token);
            break;
          } else {
            console.warn(`⚠️ Attempt ${attempts}: No FCM token received`);
          }
        } catch (tokenError) {
          console.warn(`⚠️ Attempt ${attempts}: Failed to get FCM token:`, tokenError);
          
          // Check for specific APNs token error
          if (tokenError && typeof tokenError === 'object' && 'message' in tokenError && 
              typeof tokenError.message === 'string' && tokenError.message.includes('APNs token')) {
            console.error('🔴 APNs token not available - device registration may have failed');
            console.error('🔴 This usually means the device registration failed earlier');
            if (attempts === maxAttempts) {
              console.log('❌ FCM token generation failed due to missing APNs token');
              return;
            }
          }
          
          if (attempts === maxAttempts) {
            console.log('ℹ️ FCM token not available - this is normal on iOS Simulator');
            console.log('ℹ️ Use a real device or TestFlight for push notifications');
            return;
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Note: APNS token listener might not be available in this Firebase version
      console.log('📱 APNS token will be handled automatically by Firebase');

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
      console.error('❌ FCM initialization failed:', error);
      console.log('ℹ️ This is expected on iOS Simulator - use a real device for FCM testing');
    }
  }

  // Register FCM token with server
  private async registerTokenWithServer(token: string): Promise<void> {
    try {
      console.log('📤 Registering FCM token with server:', API_CONFIG.BASE_URL);
      
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

      console.log('📡 Server response status:', response.status);
      console.log('📡 Server response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ FCM token registered with server:', result);
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Failed to register FCM token with server. Status:', response.status);
        console.warn('⚠️ Error response:', errorText);
      }
    } catch (error) {
      console.warn('⚠️ Error registering FCM token with server:', error);
      console.warn('⚠️ Server URL:', API_CONFIG.BASE_URL);
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
      // Check if we have a valid FCM token
      if (!this.fcmToken) {
        console.warn('⚠️ No FCM token available, trying to get one...');
        try {
          const token = await messaging().getToken();
          if (token) {
            this.fcmToken = token;
            console.log('✅ Got FCM token:', token.substring(0, 20) + '...');
          } else {
            throw new Error('Failed to get FCM token');
          }
        } catch (tokenError) {
          console.error('❌ Failed to get FCM token:', tokenError);
          throw new Error('No FCM token available for sending notifications');
        }
      }

      console.log('📤 Sending FCM notification to server:', API_CONFIG.BASE_URL);
      console.log('📤 FCM Token:', this.fcmToken.substring(0, 20) + '...');
      console.log('📤 Notification data:', notificationData);
      
      const requestBody = {
        ...notificationData,
        token: this.fcmToken,
        platform: Platform.OS,
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notification/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Server response status:', response.status);
      console.log('📡 Server response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Server responded with status: ${response.status}. Error: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ FCM notification sent successfully via server:', result);
    } catch (error) {
      console.error('❌ Failed to send FCM notification via server:', error);
      console.error('❌ Server URL:', API_CONFIG.BASE_URL);
      console.error('❌ FCM Token:', this.fcmToken ? 'Available' : 'Missing');
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
          // First, check if we can register for remote notifications
          const canRegister = await messaging().hasPermission();
          console.log('🔍 Current iOS permission status:', canRegister);
          
          // Request permission with all options
          const authStatus = await messaging().requestPermission({
            alert: true,
            badge: true,
            sound: true,
            announcement: false,
            carPlay: false,
            criticalAlert: false,
            provisional: false,
          });
          
          console.log('📱 iOS permission request result:', authStatus);
          
          const granted = authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
                         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          
          await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(granted));
          
          if (granted) {
            // Register for remote notifications
            try {
              await messaging().registerDeviceForRemoteMessages();
              console.log('✅ Successfully registered for remote notifications');
            } catch (registerError) {
              console.warn('⚠️ Failed to register for remote notifications:', registerError);
            }
          }
          
          console.log('✅ iOS notification permission result:', granted, authStatus);
          return granted;
        } catch (firebaseError) {
          console.warn('⚠️ Firebase messaging not available, falling back to basic permissions:', firebaseError);
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
        case '5min':
          const fiveMinPassed = timeDiff >= 5 * 60 * 1000; // 5 minutes
          if (fiveMinPassed) console.log('⚡ 5-minute notification due');
          return fiveMinPassed;
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
  async sendQuoteNotification(quote: Quote, type: 'daily_quote' | 'hourly_quote' | '5min_quote'): Promise<void> {
    try {
      const title = type === 'daily_quote' ? '🧘 Daily Wisdom' : 
                   type === '5min_quote' ? '⚡ Quick Inspiration' : '✨ Hourly Inspiration';
      const body = `"${quote.text}" - ${quote.author}`;

      console.log(`🔔 Sending push notification: ${title} - ${body.substring(0, 50)}...`);
      
      // Force FCM token generation if not available
      if (!this.fcmToken) {
        console.log('🔑 No FCM token available, forcing token generation...');
        try {
          const token = await messaging().getToken();
          if (token) {
            this.fcmToken = token;
            console.log('✅ FCM token generated:', token.substring(0, 20) + '...');
          } else {
            throw new Error('Failed to get FCM token - check Firebase configuration');
          }
        } catch (tokenError) {
          console.error('❌ FCM token generation failed:', tokenError);
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
      throw error; // Re-throw to show the real error
    }
  }

  // Manual trigger for testing notifications
  async sendTestNotification(): Promise<void> {
    try {
      console.log('🧪 Sending test notification...');
      
      // Check if we're on iOS Simulator
      if (Platform.OS === 'ios') {
        try {
          const DeviceInfo = require('react-native-device-info');
          console.log('📱 DeviceInfo loaded:', !!DeviceInfo);
          
          if (DeviceInfo && typeof DeviceInfo.isSimulator === 'function') {
            const isIOSSimulator = await DeviceInfo.isSimulator();
            console.log('📱 iOS Simulator:', isIOSSimulator);
            
            if (isIOSSimulator) {
              console.log('📱 iOS Simulator detected - using local notification');
              Alert.alert(
                '📱 iOS Simulator Notice',
                'FCM does not work on iOS Simulator. This is a local notification test.\n\nTo test real push notifications, use a physical device or TestFlight.',
                [{ text: 'OK' }]
              );
              return;
            }
          } else {
            console.log('⚠️ DeviceInfo.isSimulator not available, continuing...');
          }
        } catch (error) {
          console.log('Could not check simulator status:', error);
        }
      }

      // Check if we have FCM token for real devices
      if (!this.fcmToken) {
        console.log('⚠️ No FCM token available');
        
        // Show appropriate message based on platform
        if (Platform.OS === 'ios') {
          Alert.alert(
            '⚠️ FCM Token Missing',
            'FCM token is not available. This could be because:\n\n' +
            '1. You\'re running on iOS Simulator (FCM doesn\'t work here)\n' +
            '2. Firebase is not properly configured\n' +
            '3. Notification permissions are not granted\n\n' +
            'Try on a real device or TestFlight for FCM testing.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            '⚠️ FCM Token Missing',
            'FCM token is not available. Check Firebase configuration and permissions.',
            [{ text: 'OK' }]
          );
        }
        return;
      }

      const testQuote: Quote = {
        id: 999,
        text: 'This is a test notification from Guras! 🌟',
        author: 'Test',
        category: 'test'
      };

      await this.sendQuoteNotification(testQuote, 'daily_quote');
      console.log('✅ Test notification sent successfully');
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      Alert.alert(
        '⚠️ Test Error',
        'There was an issue sending the notification: ' + (error?.message || 'Unknown error'),
        [{ text: 'OK' }]
      );
    }
  }

  // Schedule a notification for a specific time
  async scheduleNotification(quote: Quote, date: Date, type: 'daily_quote' | 'hourly_quote' | '5min_quote'): Promise<void> {
    try {
      const title = type === 'daily_quote' ? '🧘 Daily Wisdom' : 
                   type === '5min_quote' ? '⚡ Quick Inspiration' : '✨ Hourly Inspiration';
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

  // Debug function to check notification status
  async debugNotificationStatus(): Promise<void> {
    try {
      console.log('🔍 === NOTIFICATION DEBUG INFO ===');
      
      // Check if we're on iOS Simulator
      let isIOSSimulator = false;
      if (Platform.OS === 'ios') {
        try {
          const DeviceInfo = require('react-native-device-info');
          if (DeviceInfo && typeof DeviceInfo.isSimulator === 'function') {
            isIOSSimulator = await DeviceInfo.isSimulator();
          } else {
            console.log('⚠️ DeviceInfo.isSimulator not available');
          }
        } catch (error) {
          console.log('Could not check simulator status:', error);
        }
      }
      
      console.log('📱 Platform:', Platform.OS);
      console.log('📱 iOS Simulator:', isIOSSimulator);
      
      // Check FCM availability
      console.log('📱 Firebase messaging available:', !!messaging);
      
      // Check permission status
      const hasPermission = await this.hasPermission();
      console.log('🔔 Has permission:', hasPermission);
      
      // Check FCM token
      console.log('🔑 FCM token exists:', !!this.fcmToken);
      if (this.fcmToken) {
        console.log('🔑 FCM token preview:', this.fcmToken.substring(0, 20) + '...');
      }
      
      // Check stored token
      const storedToken = await safeNotificationGetItem(NOTIFICATION_STORAGE_KEYS.FCM_TOKEN);
      console.log('💾 Stored FCM token exists:', !!storedToken);
      
      // Check notification preferences
      const preferences = await quotesService.getNotificationPreferences();
      console.log('⚙️ Notification preferences:', preferences);
      
      // Check last notification time
      const lastNotification = await safeNotificationGetItem(NOTIFICATION_STORAGE_KEYS.LAST_NOTIFICATION_TIME);
      console.log('⏰ Last notification time:', lastNotification);
      
      // Check if scheduler is running
      console.log('🔄 Scheduler running:', !!this.backgroundTaskId);
      
      // Certificate trust check for iOS
      if (Platform.OS === 'ios' && !isIOSSimulator) {
        console.log('🔐 CERTIFICATE CHECK:');
        console.log('🔐 Check Keychain Access for "Apple Push Services: com.cosmos.guras"');
        console.log('🔐 Certificate should be set to "Always Trust"');
        console.log('🔐 If certificate shows "not trusted", FCM will fail');
      }
      
      console.log('🔍 === END DEBUG INFO ===');
      
      // Show alert with debug info
      Alert.alert(
        '🔍 Notification Debug Info',
        `Platform: ${Platform.OS}\n` +
        `iOS Simulator: ${isIOSSimulator ? '✅ Yes' : '❌ No'}\n` +
        `Permission: ${hasPermission ? '✅ Granted' : '❌ Denied'}\n` +
        `FCM Token: ${this.fcmToken ? '✅ Available' : '❌ Missing'}\n` +
        `Preferences: ${preferences.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `Scheduler: ${this.backgroundTaskId ? '✅ Running' : '❌ Stopped'}\n\n` +
        `${isIOSSimulator ? '⚠️ FCM does not work on iOS Simulator!\n\n' : ''}` +
        `${Platform.OS === 'ios' && !isIOSSimulator && !this.fcmToken ? '🔐 FCM Token Missing - Check Firebase Console\n\n' : ''}` +
        `If notifications aren't working:\n` +
        `1. Check Settings → Notifications → Guras\n` +
        `2. Ensure "Allow Notifications" is ON\n` +
        `3. Use a real device or TestFlight for FCM testing\n` +
        `${Platform.OS === 'ios' && !isIOSSimulator && !this.fcmToken ? '4. Verify Firebase Console APNs setup' : ''}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error in debug function:', error);
    }
  }

  // Test FCM token generation specifically for TestFlight debugging
  async testFCMTokenGeneration(): Promise<void> {
    try {
      console.log('🧪 === FCM TOKEN GENERATION TEST ===');
      
      // Check platform
      console.log('📱 Platform:', Platform.OS);
      
      if (Platform.OS === 'ios') {
        try {
          const DeviceInfo = require('react-native-device-info');
          console.log('📱 DeviceInfo loaded:', !!DeviceInfo);
          
          if (DeviceInfo && typeof DeviceInfo.isSimulator === 'function') {
            const isIOSSimulator = await DeviceInfo.isSimulator();
            console.log('📱 iOS Simulator:', isIOSSimulator);
            
            if (isIOSSimulator) {
              Alert.alert('📱 iOS Simulator', 'FCM tokens cannot be generated on iOS Simulator. Use a real device or TestFlight.');
              return;
            }
          } else {
            console.log('⚠️ DeviceInfo.isSimulator not available, continuing...');
            console.log('📱 DeviceInfo methods:', Object.keys(DeviceInfo || {}));
          }
        } catch (error) {
          console.log('Could not check simulator status:', error);
        }
      }

      console.log('🔑 Attempting to get FCM token...');
      
      // Check if messaging is available
      if (!messaging) {
        Alert.alert('❌ Error', 'Firebase messaging is not available');
        return;
      }

      console.log('✅ Firebase messaging module is available');
      console.log('🔧 Testing basic messaging functionality...');

      // Skip Firebase app check - go directly to messaging
      console.log('🔧 Skipping Firebase app check, testing messaging directly...');

      // Try to access messaging directly - this should trigger Firebase initialization
      let hasPermission;
      try {
        console.log('🔧 Testing Firebase messaging access...');
        hasPermission = await messaging().hasPermission();
        console.log('🔔 Permission status:', hasPermission);
      } catch (messagingError) {
        console.error('❌ Firebase messaging not available:', messagingError);
        console.error('🔴 Messaging error details:', JSON.stringify(messagingError, null, 2));
        
        // Try alternative approach
        try {
          console.log('🔧 Trying alternative Firebase messaging approach...');
          const messagingInstance = messaging();
          hasPermission = await messagingInstance.hasPermission();
          console.log('✅ Alternative approach worked, permission status:', hasPermission);
        } catch (altError) {
          console.error('❌ Alternative approach also failed:', altError);
          Alert.alert('❌ Firebase Error', 'Firebase messaging is not available. Please restart the app.');
          return;
        }
      }
      
      if (hasPermission !== messaging.AuthorizationStatus.AUTHORIZED && 
          hasPermission !== messaging.AuthorizationStatus.PROVISIONAL) {
        Alert.alert('❌ Permission Denied', 'Notification permission is required for FCM tokens');
        return;
      }

      // Register for remote messages and wait for APNS token
      try {
        console.log('📱 Registering for remote messages...');
        await messaging().registerDeviceForRemoteMessages();
        console.log('✅ Successfully registered for remote messages');
        
        // Wait for APNS token to be available
        console.log('⏳ Waiting for APNS token to be set...');
        let apnsTokenAvailable = false;
        let attempts = 0;
        const maxAttempts = 10; // Wait up to 10 seconds
        
        while (!apnsTokenAvailable && attempts < maxAttempts) {
          attempts++;
          console.log(`🔍 Attempt ${attempts}/${maxAttempts}: Checking for APNS token...`);
          
          try {
            // Try to get APNS token - this will fail if not available, but that's expected
            const apnsToken = await messaging().getAPNSToken();
            if (apnsToken) {
              console.log('✅ APNS token is available');
              apnsTokenAvailable = true;
              break;
            }
          } catch (apnsError) {
            console.log(`⏳ APNS token not ready yet (attempt ${attempts})`);
          }
          
          // Wait 1 second before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!apnsTokenAvailable) {
          console.warn('⚠️ APNS token not available after waiting, but continuing anyway...');
        }
        
      } catch (registerError) {
        console.warn('⚠️ Failed to register for remote messages:', registerError);
        console.error('🔴 Registration error details:', JSON.stringify(registerError, null, 2));
        Alert.alert('⚠️ Registration Failed', 'Failed to register for remote notifications. This might be a certificate issue.');
        return;
      }

      // Try to get FCM token with detailed error handling
      try {
        console.log('🔑 Requesting FCM token...');
        const token = await messaging().getToken();
        console.log('🔑 Raw token response:', token);
        
        if (token && token.length > 0) {
          this.fcmToken = token;
          await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.FCM_TOKEN, token);
          console.log('✅ FCM Token generated successfully!');
          console.log('🔑 Token preview:', token.substring(0, 30) + '...');
          console.log('🔑 Token length:', token.length);
          
          Alert.alert(
            '✅ FCM Token Generated!',
            `Token: ${token.substring(0, 30)}...\n\nThis means FCM is working correctly in your TestFlight build.`,
            [{ text: 'OK' }]
          );
        } else {
          throw new Error('No token received or token is empty');
        }
              } catch (tokenError: any) {
          console.error('❌ FCM token generation failed:', tokenError);
          console.error('🔴 Token error details:', JSON.stringify(tokenError, null, 2));
          
          // More detailed error analysis
          let errorMessage = 'Unknown error';
          let errorType = 'Unknown';
          
          if (tokenError?.message) {
            errorMessage = tokenError.message;
            if (errorMessage.includes('network') || errorMessage.includes('connection')) {
              errorType = 'Network';
            } else if (errorMessage.includes('permission')) {
              errorType = 'Permission';
            } else if (errorMessage.includes('certificate') || errorMessage.includes('APNs')) {
              errorType = 'Certificate';
            } else if (errorMessage.includes('configuration') || errorMessage.includes('Firebase')) {
              errorType = 'Configuration';
            }
          }
          
          console.log(`🔍 Error type: ${errorType}`);
          console.log(`🔍 Error message: ${errorMessage}`);
          
          Alert.alert(
            `❌ FCM Token Failed (${errorType})`,
            `Failed to generate FCM token.\n\n` +
            `Error: ${errorMessage}\n\n` +
            `Possible solutions:\n` +
            `${errorType === 'Network' ? '• Check internet connection\n' : ''}` +
            `${errorType === 'Permission' ? '• Check notification permissions\n' : ''}` +
            `${errorType === 'Certificate' ? '• Verify Firebase console APNs setup\n' : ''}` +
            `${errorType === 'Configuration' ? '• Check Firebase configuration files\n' : ''}` +
            `• Ensure you\'re using TestFlight, not simulator`,
            [{ text: 'OK' }]
          );
        }
        
        console.log('🧪 === END FCM TOKEN TEST ===');
      } catch (error: any) {
        console.error('Error in FCM token test:', error);
        Alert.alert('❌ Test Error', 'An error occurred during the FCM token test: ' + (error?.message || 'Unknown error'));
      }
  }

  // Cleanup
  destroy(): void {
    this.stopQuoteScheduler();
    console.log('✅ Notification service destroyed');
  }

  // Simple test to check basic Firebase connectivity
  async testBasicFirebaseConnection(): Promise<void> {
    try {
      console.log('🔍 === BASIC FIREBASE CONNECTION TEST ===');

      // Check if Firebase messaging module is available
      if (!messaging) {
        Alert.alert('❌ Error', 'Firebase messaging module not available');
        return;
      }

      // Try to access Firebase app properly
      try {
        const firebaseApp = require('@react-native-firebase/app').default;
        const app = firebaseApp();
        console.log('✅ Firebase app available:', app.name);
        console.log('✅ Firebase app options:', app.options);
      } catch (firebaseError) {
        console.error('❌ Firebase app error:', firebaseError);
        Alert.alert('❌ Firebase Error', 'Firebase app is not properly initialized');
        return;
      }

      // Check if we can access messaging
      try {
        const messagingInstance = messaging();
        console.log('✅ Firebase messaging available');

        // Try to check permission status as a basic test
        const permissionStatus = await messagingInstance.hasPermission();
        console.log('✅ Firebase messaging permission check successful:', permissionStatus);
      } catch (messagingError) {
        console.error('❌ Firebase messaging error:', messagingError);
        Alert.alert('❌ Messaging Error', 'Firebase messaging is not available');
        return;
      }

      Alert.alert('✅ Firebase Working!', 'Firebase is properly connected and messaging is available');
      console.log('🔍 === END BASIC TEST ===');
    } catch (error: any) {
      console.error('Error in basic Firebase test:', error);
      Alert.alert('❌ Test Error', 'Basic Firebase test failed: ' + (error?.message || 'Unknown error'));
    }
  }
}

export default NotificationService.getInstance(); 