import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import navigationReducer from './navigationSlice';
import themeReducer from './themeSlice';
import meditationReducer from './meditationSliceNew';
import guidedMeditationReducer from './guidedMeditationSlice';
import bottomNavReducer from './bottomNavSlice';
import spiritualTeacherReducer from './spiritualTeacherSlice';
import teacherReducer from './teacherSlice';
import recommendationReducer from './recommendationSlice';
import journalReducer from './journalSlice';

// Create persisted reducers
const persistedMeditationReducer = persistReducer(
  {
    key: 'meditation',
    storage: AsyncStorage,
    whitelist: ['totalSessions', 'totalMinutes', 'lastActiveTime'],
  },
  meditationReducer
);

const persistedGuidedMeditationReducer = persistReducer(
  {
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
  },
  guidedMeditationReducer
);

const persistedJournalReducer = persistReducer(
  {
    key: 'journal',
    storage: AsyncStorage,
    whitelist: ['entries'],
  },
  journalReducer
);

const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    theme: themeReducer,
    meditation: persistedMeditationReducer,
    guidedMeditation: persistedGuidedMeditationReducer,
    bottomNav: bottomNavReducer,
    spiritualTeacher: spiritualTeacherReducer,
    teacher: teacherReducer,
    recommendations: recommendationReducer,
    journal: persistedJournalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { store };
export default store;