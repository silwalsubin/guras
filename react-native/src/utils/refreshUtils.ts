import quotesService from '@/services/quotesService';
import notificationService from '@/services/notificationService';

export interface RefreshOptions {
  refreshQuotes?: boolean;
  refreshNotifications?: boolean;
  refreshProgress?: boolean;
  refreshUserData?: boolean;
}

export interface RefreshResult {
  success: boolean;
  message: string;
  errors?: string[];
}

/**
 * Shared refresh utility for consistent refresh behavior across screens
 */
export class RefreshUtils {
  /**
   * Refresh home screen data
   */
  static async refreshHomeScreen(): Promise<RefreshResult> {
    const errors: string[] = [];
    
    try {
      // Refresh daily quote
      await quotesService.updateQuoteIfNeeded();
      console.log('✅ Daily quote refreshed');
    } catch (error) {
      console.error('Error refreshing daily quote:', error);
      errors.push('Failed to refresh daily quote');
    }

    // TODO: Add more refresh logic for:
    // - Refresh progress data
    // - Update recent sessions
    // - Check for new content

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Home screen refreshed successfully' : 'Some items failed to refresh',
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Refresh learn screen data
   */
  static async refreshLearnScreen(): Promise<RefreshResult> {
    const errors: string[] = [];
    
    try {
      // Refresh daily wisdom quote
      await quotesService.updateQuoteIfNeeded();
      console.log('✅ Daily wisdom refreshed');
    } catch (error) {
      console.error('Error refreshing daily wisdom:', error);
      errors.push('Failed to refresh daily wisdom');
    }

    // TODO: Add more refresh logic for:
    // - Refresh featured content
    // - Check for new courses/teachings
    // - Update learning progress

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Learn screen refreshed successfully' : 'Some items failed to refresh',
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Refresh profile screen data
   */
  static async refreshProfileScreen(): Promise<RefreshResult> {
    const errors: string[] = [];
    
    try {
      // Refresh notification preferences
      await quotesService.getNotificationPreferences();
      console.log('✅ Notification preferences refreshed');
    } catch (error) {
      console.error('Error refreshing notification preferences:', error);
      errors.push('Failed to refresh notification preferences');
    }

    try {
      // Simulate a small delay to make refresh feel more substantial
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('✅ Profile refresh delay completed');
    } catch (error) {
      console.error('Error during refresh delay:', error);
      errors.push('Failed to complete refresh delay');
    }

    // TODO: Add more refresh logic for:
    // - User profile data
    // - App settings
    // - Sync with server

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Profile refreshed successfully' : 'Some items failed to refresh',
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Refresh notification settings
   */
  static async refreshNotificationSettings(): Promise<RefreshResult> {
    const errors: string[] = [];
    
    try {
      // Reload preferences and check permission
      await quotesService.getNotificationPreferences();
      await notificationService.hasPermission();
      console.log('✅ Notification settings refreshed');
    } catch (error) {
      console.error('Error refreshing notification settings:', error);
      errors.push('Failed to refresh notification settings');
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Notification settings refreshed successfully' : 'Some items failed to refresh',
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Generic refresh function with options
   */
  static async refreshWithOptions(options: RefreshOptions): Promise<RefreshResult> {
    const errors: string[] = [];
    
    if (options.refreshQuotes) {
      try {
        await quotesService.updateQuoteIfNeeded();
        console.log('✅ Quotes refreshed');
      } catch (error) {
        console.error('Error refreshing quotes:', error);
        errors.push('Failed to refresh quotes');
      }
    }

    if (options.refreshNotifications) {
      try {
        await quotesService.getNotificationPreferences();
        await notificationService.hasPermission();
        console.log('✅ Notifications refreshed');
      } catch (error) {
        console.error('Error refreshing notifications:', error);
        errors.push('Failed to refresh notifications');
      }
    }

    // TODO: Add more refresh options as needed

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Refresh completed successfully' : 'Some items failed to refresh',
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
