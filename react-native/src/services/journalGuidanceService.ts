import { apiService } from './api';
import { JournalEntry } from '@/types/journal';

export interface PersonalizedGuidance {
  quote: string;
  guidance: string;
  supportiveMessage: string;
}

export interface GuidanceResponse {
  guidance: string | PersonalizedGuidance;
  hasEntries: boolean;
  entriesAnalyzed?: number;
  timestamp?: string;
}

/**
 * Service for fetching and managing personalized journal guidance
 */
class JournalGuidanceService {
  private guidanceCache: Map<string, { data: GuidanceResponse; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get personalized guidance based on recent journal entries
   * Uses caching to avoid excessive API calls
   */
  async getPersonalizedGuidance(userId: string, entryCount: number = 5): Promise<GuidanceResponse> {
    try {
      console.log(`📖 Fetching personalized guidance for user ${userId} using ${entryCount} entries`);

      // Check cache first
      const cacheKey = `${userId}-${entryCount}`;
      const cached = this.guidanceCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('✅ Using cached guidance');
        return cached.data;
      }

      // Fetch from API
      const response = await apiService.makeRequest<GuidanceResponse>(
        `/api/journal/guidance?entryCount=${entryCount}`
      );

      if (response.success && response.data) {
        // Cache the response
        this.guidanceCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });

        console.log('✅ Successfully fetched personalized guidance');
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch personalized guidance');
      }
    } catch (error) {
      console.error('❌ Error fetching personalized guidance:', error);
      throw error;
    }
  }

  /**
   * Parse guidance response into structured format
   */
  parseGuidance(guidanceData: string | PersonalizedGuidance): PersonalizedGuidance {
    // If it's already an object, return it
    if (typeof guidanceData === 'object' && guidanceData !== null) {
      return {
        quote: guidanceData.quote || 'Every moment is a fresh beginning.',
        guidance: guidanceData.guidance || 'Trust your journey.',
        supportiveMessage: guidanceData.supportiveMessage || 'You are on a beautiful journey of self-discovery.'
      };
    }

    // If it's a string, try to parse it
    if (typeof guidanceData === 'string') {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(guidanceData);
        return {
          quote: parsed.quote || 'Every moment is a fresh beginning.',
          guidance: parsed.guidance || guidanceData,
          supportiveMessage: parsed.supportiveMessage || 'You are on a beautiful journey of self-discovery.'
        };
      } catch {
        // If parsing fails, return as guidance text
        return {
          quote: 'Every moment is a fresh beginning.',
          guidance: guidanceData,
          supportiveMessage: 'Your reflections are valuable and meaningful.'
        };
      }
    }

    // Fallback
    return {
      quote: 'Every moment is a fresh beginning.',
      guidance: 'Trust your journey.',
      supportiveMessage: 'You are on a beautiful journey of self-discovery.'
    };
  }

  /**
   * Clear cache for a specific user or all users
   */
  clearCache(userId?: string): void {
    if (userId) {
      // Clear cache for specific user
      const keysToDelete = Array.from(this.guidanceCache.keys()).filter(key => key.startsWith(userId));
      keysToDelete.forEach(key => this.guidanceCache.delete(key));
      console.log(`🗑️ Cleared cache for user ${userId}`);
    } else {
      // Clear all cache
      this.guidanceCache.clear();
      console.log('🗑️ Cleared all guidance cache');
    }
  }

  /**
   * Invalidate cache when new journal entry is created
   */
  invalidateCacheOnNewEntry(userId: string): void {
    this.clearCache(userId);
    console.log(`🔄 Invalidated guidance cache for user ${userId} due to new journal entry`);
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.guidanceCache.size,
      entries: Array.from(this.guidanceCache.keys())
    };
  }
}

export const journalGuidanceService = new JournalGuidanceService();

