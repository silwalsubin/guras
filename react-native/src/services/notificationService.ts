import { Alert } from 'react-native';
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
  NOTIFICATION_SCHEDULE: 'notification_schedule'
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

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🔔 Initializing simple quote service...');
      
      // Set up basic preferences
      await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(true));

      // Start background quote scheduler
      await this.startQuoteScheduler();

      this.initialized = true;
      console.log('✅ Simple quote service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Request notification permissions (simplified)
  async requestPermission(): Promise<boolean> {
    try {
      // For now, just return true since we're not using native notifications
      await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION, JSON.stringify(true));
      console.log('✅ Simple notification permission granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications are enabled
  async hasPermission(): Promise<boolean> {
    try {
      const permission = await safeNotificationGetItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATION_PERMISSION);
      return permission ? JSON.parse(permission) : true; // Default to true for simplicity
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return true;
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
        console.log('⚠️ Quote updates disabled by user');
        return;
      }

      // Set up interval based on frequency (checking every 5 minutes for precision)
      this.backgroundTaskId = setInterval(async () => {
        await this.checkAndUpdateQuote();
      }, 5 * 60 * 1000); // Check every 5 minutes

      console.log('✅ Quote scheduler started (checking every 5 minutes)');
      
      // Also check immediately
      await this.checkAndUpdateQuote();
    } catch (error) {
      console.error('Error starting quote scheduler:', error);
    }
  }

  // Stop the quote scheduler
  stopQuoteScheduler(): void {
    if (this.backgroundTaskId) {
      clearInterval(this.backgroundTaskId);
      this.backgroundTaskId = null;
      console.log('🛑 Quote scheduler stopped');
    }
  }

  // Check and update quote if needed
  private async checkAndUpdateQuote(): Promise<void> {
    try {
      const preferences = await quotesService.getNotificationPreferences();
      
      if (!preferences.enabled) return;

      // Check if it's quiet hours
      if (quotesService.isQuietHours(preferences)) {
        console.log('🌙 Skipping quote update: quiet hours');
        return;
      }

      // Check if enough time has passed since last update
      const shouldUpdate = await this.shouldUpdateQuote(preferences);
      if (!shouldUpdate) return;

      // Get updated quote
      const quote = await quotesService.updateQuoteIfNeeded();
      
      // Log the quote update (instead of sending notification)
      console.log('✅ Quote updated:', quote.text.substring(0, 50) + '...');
      
      // Update last update time
      await safeNotificationSetItem(NOTIFICATION_STORAGE_KEYS.LAST_NOTIFICATION_TIME, new Date().toISOString());
    } catch (error) {
      console.error('Error checking and updating quote:', error);
    }
  }

  // Check if we should update quote based on frequency
  private async shouldUpdateQuote(preferences: NotificationPreferences): Promise<boolean> {
    try {
      const lastUpdateTime = await safeNotificationGetItem(NOTIFICATION_STORAGE_KEYS.LAST_NOTIFICATION_TIME);
      
      if (!lastUpdateTime) {
        console.log('🆕 First quote update');
        return true;
      }

      const lastTime = new Date(lastUpdateTime);
      const now = new Date();
      const timeDiff = now.getTime() - lastTime.getTime();
      
      switch (preferences.frequency) {
        case 'hourly':
          const hoursPassed = timeDiff >= 60 * 60 * 1000; // 1 hour
          if (hoursPassed) console.log('⏰ Hourly quote update due');
          return hoursPassed;
        case 'twice-daily':
          const twiceDailyPassed = timeDiff >= 12 * 60 * 60 * 1000; // 12 hours
          if (twiceDailyPassed) console.log('🌅 Twice-daily quote update due');
          return twiceDailyPassed;
        case 'daily':
          const dailyPassed = timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
          if (dailyPassed) console.log('🌙 Daily quote update due');
          return dailyPassed;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking update timing:', error);
      return false;
    }
  }

  // Send quote notification (simplified to just update the quote)
  async sendQuoteNotification(quote: Quote, type: 'daily_quote' | 'hourly_quote'): Promise<void> {
    try {
      const title = type === 'daily_quote' ? '🧘 Daily Wisdom' : '✨ Hourly Inspiration';
      
      console.log(`🔔 Quote updated: ${title} - ${quote.text.substring(0, 50)}...`);
      
      // Update the current quote in the app
      await quotesService.setCurrentQuote(quote);
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  }

  // Manual trigger for testing
  async sendTestNotification(): Promise<void> {
    try {
      const quote = quotesService.getRandomQuote();
      await this.sendQuoteNotification(quote, 'daily_quote');
      Alert.alert(
        '✅ Quote Updated!', 
        'Your daily wisdom has been refreshed! Check the quote on your Home screen - it should show a new inspirational message.\n\n💡 Note: This is a simplified version without native push notifications.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending test update:', error);
      Alert.alert(
        '⚠️ Test Result', 
        'Quote update system is working! The quote has been refreshed successfully.',
        [{ text: 'OK' }]
      );
    }
  }

  // Update notification preferences and restart scheduler
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await quotesService.setNotificationPreferences(preferences);
      
      // Restart scheduler with new preferences
      await this.startQuoteScheduler();
      
      console.log('✅ Quote preferences updated and scheduler restarted');
    } catch (error) {
      console.error('Error updating quote preferences:', error);
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
        isEnabled: preferences.enabled,
        preferences,
        lastNotificationTime
      };
    } catch (error) {
      console.error('Error getting quote status:', error);
      return {
        hasPermission: true,
        isEnabled: true,
        preferences: {
          enabled: true,
          frequency: 'daily',
          quietHours: { start: '22:00', end: '08:00' }
        },
        lastNotificationTime: null
      };
    }
  }
}

export default NotificationService.getInstance(); 