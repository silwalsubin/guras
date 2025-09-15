import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistConfig } from 'redux-persist';

// Persist configuration for meditation-related data
export const meditationPersistConfig: PersistConfig<any> = {
  key: 'meditation',
  storage: AsyncStorage,
  whitelist: ['meditation', 'guidedMeditation'], // Only persist these slices
  // Transform data for better storage
  transforms: [],
};

// Root persist configuration
export const rootPersistConfig: PersistConfig<any> = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['meditation', 'guidedMeditation'], // Only persist meditation data for now
  blacklist: ['navigation', 'bottomNav', 'theme'], // Don't persist UI state
  transforms: [],
};

// Individual slice configurations
export const meditationSliceConfig: PersistConfig<any> = {
  key: 'meditation',
  storage: AsyncStorage,
  whitelist: ['totalSessions', 'totalMinutes', 'lastActiveTime'], // Only persist essential data
};

export const guidedMeditationSliceConfig: PersistConfig<any> = {
  key: 'guidedMeditation',
  storage: AsyncStorage,
  whitelist: [
    'completedSessions',
    'totalGuidedSessions', 
    'totalGuidedMinutes',
    'enrolledPrograms',
    'programProgress',
    'completedPrograms',
    'achievements',
    'unlockedAchievements',
    'guidedStreak',
    'longestGuidedStreak',
    'averageSessionRating',
    'recentSessions',
    'milestones'
  ],
};
