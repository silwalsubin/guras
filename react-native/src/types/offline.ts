// Offline storage and sync types

export interface SyncMetadata {
  lastSyncedAt: number;
  isDirty: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
  retryCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface OfflineEntity {
  id: string;
  syncMetadata: SyncMetadata;
}

// Meditation-specific offline types
export interface OfflineMeditationSession extends OfflineEntity {
  sessionId: string;
  duration: number; // in minutes
  completedAt: string;
  rating?: number;
  notes?: string;
  mood?: {
    before: number;
    after: number;
  };
  sessionType: 'timer' | 'guided';
  isCompleted: boolean;
}

export interface OfflineGuidedSession extends OfflineEntity {
  sessionId: string;
  title: string;
  teacherName: string;
  theme: string;
  duration: number;
  completedAt: string;
  rating?: number;
  mood?: {
    before: number;
    after: number;
  };
  programId?: string;
  programDay?: number;
  isCompleted: boolean;
}

export interface OfflineProgramProgress extends OfflineEntity {
  programId: string;
  currentDay: number;
  completedDays: number[];
  enrolledAt: string;
  lastActivityAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface OfflineAchievement extends OfflineEntity {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: 'sessions' | 'programs' | 'streaks' | 'time' | 'teachers' | 'themes';
  requirement: {
    type: 'count' | 'streak' | 'program' | 'time' | 'variety';
    target: number;
    condition?: string;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

// Sync queue types
export interface SyncQueueItem {
  id: string;
  entityType: 'meditation' | 'guidedMeditation' | 'program' | 'achievement';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncResult {
  success: boolean;
  syncedItems: string[];
  failedItems: string[];
  conflicts: ConflictItem[];
  timestamp: number;
}

export interface ConflictItem {
  entityId: string;
  entityType: string;
  localData: any;
  serverData: any;
  conflictType: 'timestamp' | 'data' | 'deletion';
  resolution: 'local' | 'server' | 'merge' | 'manual';
}

// Offline storage configuration
export interface OfflineConfig {
  maxRetries: number;
  retryDelay: number;
  maxRetryDelay: number;
  batchSize: number;
  syncInterval: number; // in milliseconds
  conflictResolution: 'local' | 'server' | 'timestamp' | 'manual';
}

export const DEFAULT_OFFLINE_CONFIG: OfflineConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  maxRetryDelay: 30000, // 30 seconds
  batchSize: 10,
  syncInterval: 30000, // 30 seconds
  conflictResolution: 'timestamp',
};
