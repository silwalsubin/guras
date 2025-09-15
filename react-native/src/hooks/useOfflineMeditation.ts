import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  saveMeditationSessionOffline, 
  loadOfflineStats,
  completeSession,
  setOfflineMode 
} from '@/store/meditationSliceNew';
import { 
  saveGuidedSessionOffline,
  completeGuidedSession,
  setOfflineMode as setGuidedOfflineMode 
} from '@/store/guidedMeditationSlice';
import NetInfo from '@react-native-community/netinfo';
import offlineStorageService from '@/services/offlineStorageService';

export const useOfflineMeditation = () => {
  const dispatch = useDispatch();
  const meditationState = useSelector((state: RootState) => state.meditation);
  const guidedMeditationState = useSelector((state: RootState) => state.guidedMeditation);

  // Check network status and update offline mode
  useEffect(() => {
    try {
      const unsubscribe = NetInfo.addEventListener(state => {
        const isOffline = !state.isConnected;
        dispatch(setOfflineMode(isOffline));
        dispatch(setGuidedOfflineMode(isOffline));
      });

      return () => unsubscribe();
    } catch (error) {
      console.warn('NetInfo not available, using offline storage without network detection:', error);
      // If NetInfo fails, still enable offline storage
      dispatch(setOfflineMode(false)); // Assume online but enable storage
      dispatch(setGuidedOfflineMode(false));
    }
  }, [dispatch]);

  // Fallback: If NetInfo fails, assume online mode but still enable offline storage
  useEffect(() => {
    // Set a timeout to check if NetInfo is working
    const timeout = setTimeout(() => {
      // If we haven't received any network state updates, assume online
      // but still enable offline storage functionality
      console.log('NetInfo timeout - enabling offline storage as fallback');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Load offline stats on mount
  useEffect(() => {
    dispatch(loadOfflineStats());
  }, [dispatch]);

  // Complete meditation session with offline storage
  const completeMeditationSession = useCallback(async (sessionData?: {
    rating?: number;
    notes?: string;
    mood?: { before: number; after: number };
  }) => {
    // Complete the session in Redux
    dispatch(completeSession());

    // Save to offline storage
    if (meditationState.selectedMinutes > 0) {
      await dispatch(saveMeditationSessionOffline({
        duration: meditationState.selectedMinutes,
        completedAt: new Date().toISOString(),
        rating: sessionData?.rating,
        notes: sessionData?.notes,
        mood: sessionData?.mood,
      }));
    }
  }, [dispatch, meditationState.selectedMinutes]);

  // Complete guided meditation session with offline storage
  const completeGuidedMeditationSession = useCallback(async (sessionData: {
    session: any; // GuidedMeditationSession type
    rating?: number;
    mood?: { before: number; after: number };
    programId?: string;
    programDay?: number;
  }) => {
    // Complete the session in Redux
    dispatch(completeGuidedSession(sessionData));

    // Save to offline storage
    await dispatch(saveGuidedSessionOffline(sessionData));
  }, [dispatch]);

  // Get offline statistics
  const getOfflineStats = useCallback(async () => {
    const stats = await offlineStorageService.getOfflineStats();
    return stats;
  }, []);

  // Check if we're in offline mode
  const isOffline = meditationState.isOfflineMode || guidedMeditationState.isOfflineMode;

  return {
    isOffline,
    completeMeditationSession,
    completeGuidedMeditationSession,
    getOfflineStats,
    offlineStats: {
      lastSyncTime: meditationState.lastSyncTime,
      pendingSyncCount: meditationState.pendingSyncCount,
    },
  };
};
