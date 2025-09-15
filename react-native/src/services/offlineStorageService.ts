import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  OfflineMeditationSession, 
  OfflineGuidedSession, 
  OfflineProgramProgress, 
  OfflineAchievement,
  SyncQueueItem,
  SyncMetadata,
  DEFAULT_OFFLINE_CONFIG 
} from '@/types/offline';

class OfflineStorageService {
  private static instance: OfflineStorageService;
  private config = DEFAULT_OFFLINE_CONFIG;

  // Storage keys
  private readonly KEYS = {
    MEDITATION_SESSIONS: 'offline_meditation_sessions',
    GUIDED_SESSIONS: 'offline_guided_sessions',
    PROGRAM_PROGRESS: 'offline_program_progress',
    ACHIEVEMENTS: 'offline_achievements',
    SYNC_QUEUE: 'offline_sync_queue',
    LAST_SYNC: 'offline_last_sync',
  };

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  // Generic storage methods
  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }

  // Create sync metadata
  private createSyncMetadata(isDirty: boolean = true): SyncMetadata {
    const now = Date.now();
    return {
      lastSyncedAt: 0,
      isDirty,
      syncStatus: 'pending',
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Meditation session storage
  async saveMeditationSession(session: Omit<OfflineMeditationSession, 'id' | 'syncMetadata'>): Promise<string> {
    const id = `meditation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineSession: OfflineMeditationSession = {
      id,
      syncMetadata: this.createSyncMetadata(),
      ...session,
    };

    const sessions = await this.getMeditationSessions();
    sessions.push(offlineSession);
    await this.setItem(this.KEYS.MEDITATION_SESSIONS, sessions);

    // Add to sync queue
    await this.addToSyncQueue({
      id: `sync_${id}`,
      entityType: 'meditation',
      entityId: id,
      action: 'CREATE',
      data: offlineSession,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority: 'high',
    });

    return id;
  }

  async getMeditationSessions(): Promise<OfflineMeditationSession[]> {
    return await this.getItem<OfflineMeditationSession[]>(this.KEYS.MEDITATION_SESSIONS) || [];
  }

  async updateMeditationSession(id: string, updates: Partial<OfflineMeditationSession>): Promise<void> {
    const sessions = await this.getMeditationSessions();
    const index = sessions.findIndex(s => s.id === id);
    
    if (index !== -1) {
      sessions[index] = {
        ...sessions[index],
        ...updates,
        syncMetadata: {
          ...sessions[index].syncMetadata,
          isDirty: true,
          updatedAt: Date.now(),
        },
      };
      await this.setItem(this.KEYS.MEDITATION_SESSIONS, sessions);

      // Add to sync queue
      await this.addToSyncQueue({
        id: `sync_${id}_${Date.now()}`,
        entityType: 'meditation',
        entityId: id,
        action: 'UPDATE',
        data: sessions[index],
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: this.config.maxRetries,
        priority: 'high',
      });
    }
  }

  // Guided session storage
  async saveGuidedSession(session: Omit<OfflineGuidedSession, 'id' | 'syncMetadata'>): Promise<string> {
    const id = `guided_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineSession: OfflineGuidedSession = {
      id,
      syncMetadata: this.createSyncMetadata(),
      ...session,
    };

    const sessions = await this.getGuidedSessions();
    sessions.push(offlineSession);
    await this.setItem(this.KEYS.GUIDED_SESSIONS, sessions);

    // Add to sync queue
    await this.addToSyncQueue({
      id: `sync_${id}`,
      entityType: 'guidedMeditation',
      entityId: id,
      action: 'CREATE',
      data: offlineSession,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority: 'high',
    });

    return id;
  }

  async getGuidedSessions(): Promise<OfflineGuidedSession[]> {
    return await this.getItem<OfflineGuidedSession[]>(this.KEYS.GUIDED_SESSIONS) || [];
  }

  // Program progress storage
  async saveProgramProgress(progress: Omit<OfflineProgramProgress, 'id' | 'syncMetadata'>): Promise<string> {
    const id = `program_${progress.programId}_${Date.now()}`;
    const offlineProgress: OfflineProgramProgress = {
      id,
      syncMetadata: this.createSyncMetadata(),
      ...progress,
    };

    const progresses = await this.getProgramProgresses();
    const existingIndex = progresses.findIndex(p => p.programId === progress.programId);
    
    if (existingIndex !== -1) {
      progresses[existingIndex] = offlineProgress;
    } else {
      progresses.push(offlineProgress);
    }
    
    await this.setItem(this.KEYS.PROGRAM_PROGRESS, progresses);

    // Add to sync queue
    await this.addToSyncQueue({
      id: `sync_${id}`,
      entityType: 'program',
      entityId: id,
      action: 'UPDATE',
      data: offlineProgress,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority: 'medium',
    });

    return id;
  }

  async getProgramProgresses(): Promise<OfflineProgramProgress[]> {
    return await this.getItem<OfflineProgramProgress[]>(this.KEYS.PROGRAM_PROGRESS) || [];
  }

  // Achievement storage
  async saveAchievement(achievement: Omit<OfflineAchievement, 'id' | 'syncMetadata'>): Promise<string> {
    const id = `achievement_${achievement.achievementId}_${Date.now()}`;
    const offlineAchievement: OfflineAchievement = {
      id,
      syncMetadata: this.createSyncMetadata(),
      ...achievement,
    };

    const achievements = await this.getAchievements();
    const existingIndex = achievements.findIndex(a => a.achievementId === achievement.achievementId);
    
    if (existingIndex !== -1) {
      achievements[existingIndex] = offlineAchievement;
    } else {
      achievements.push(offlineAchievement);
    }
    
    await this.setItem(this.KEYS.ACHIEVEMENTS, achievements);

    // Add to sync queue
    await this.addToSyncQueue({
      id: `sync_${id}`,
      entityType: 'achievement',
      entityId: id,
      action: 'UPDATE',
      data: offlineAchievement,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority: 'low',
    });

    return id;
  }

  async getAchievements(): Promise<OfflineAchievement[]> {
    return await this.getItem<OfflineAchievement[]>(this.KEYS.ACHIEVEMENTS) || [];
  }

  // Sync queue management
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(item);
    await this.setItem(this.KEYS.SYNC_QUEUE, queue);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return await this.getItem<SyncQueueItem[]>(this.KEYS.SYNC_QUEUE) || [];
  }

  async removeFromSyncQueue(itemId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filteredQueue = queue.filter(item => item.id !== itemId);
    await this.setItem(this.KEYS.SYNC_QUEUE, filteredQueue);
  }

  async updateSyncQueueItem(itemId: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const queue = await this.getSyncQueue();
    const index = queue.findIndex(item => item.id === itemId);
    
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      await this.setItem(this.KEYS.SYNC_QUEUE, queue);
    }
  }

  // Statistics and analytics
  async getOfflineStats(): Promise<{
    totalMeditationSessions: number;
    totalGuidedSessions: number;
    totalPrograms: number;
    totalAchievements: number;
    pendingSyncItems: number;
    lastSyncTime: number;
  }> {
    const [meditationSessions, guidedSessions, programs, achievements, syncQueue, lastSync] = await Promise.all([
      this.getMeditationSessions(),
      this.getGuidedSessions(),
      this.getProgramProgresses(),
      this.getAchievements(),
      this.getSyncQueue(),
      this.getItem<number>(this.KEYS.LAST_SYNC),
    ]);

    return {
      totalMeditationSessions: meditationSessions.length,
      totalGuidedSessions: guidedSessions.length,
      totalPrograms: programs.length,
      totalAchievements: achievements.length,
      pendingSyncItems: syncQueue.length,
      lastSyncTime: lastSync || 0,
    };
  }

  // Cleanup methods
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.removeItem(this.KEYS.MEDITATION_SESSIONS),
      this.removeItem(this.KEYS.GUIDED_SESSIONS),
      this.removeItem(this.KEYS.PROGRAM_PROGRESS),
      this.removeItem(this.KEYS.ACHIEVEMENTS),
      this.removeItem(this.KEYS.SYNC_QUEUE),
      this.removeItem(this.KEYS.LAST_SYNC),
    ]);
  }

  async clearOldData(olderThanDays: number = 30): Promise<void> {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    // Clear old meditation sessions
    const meditationSessions = await this.getMeditationSessions();
    const recentMeditationSessions = meditationSessions.filter(
      session => session.syncMetadata.createdAt > cutoffTime
    );
    await this.setItem(this.KEYS.MEDITATION_SESSIONS, recentMeditationSessions);

    // Clear old guided sessions
    const guidedSessions = await this.getGuidedSessions();
    const recentGuidedSessions = guidedSessions.filter(
      session => session.syncMetadata.createdAt > cutoffTime
    );
    await this.setItem(this.KEYS.GUIDED_SESSIONS, recentGuidedSessions);
  }
}

export default OfflineStorageService.getInstance();
