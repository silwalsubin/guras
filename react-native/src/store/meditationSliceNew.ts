import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MeditationState {
  isActive: boolean;
  timeLeft: number;
  selectedMinutes: number;
  isPaused: boolean;
  sessionStartTime: string | null; // ISO string for persistence
  totalSessions: number;
  totalMinutes: number;
  lastActiveTime: number; // timestamp for sync
  isFullScreen: boolean; // For hiding header/footer during meditation
  fadeOutStarted: boolean; // Track if fade-out has been triggered
}

const initialState: MeditationState = {
  isActive: false,
  timeLeft: 0,
  selectedMinutes: 10,
  isPaused: false,
  sessionStartTime: null,
  totalSessions: 0,
  totalMinutes: 0,
  lastActiveTime: 0,
  isFullScreen: false,
  fadeOutStarted: false,
};

const meditationSlice = createSlice({
  name: 'meditation',
  initialState,
  reducers: {
    startTimer: (state, action: PayloadAction<number>) => {
      state.isActive = true;
      state.timeLeft = action.payload * 60; // Convert minutes to seconds
      state.selectedMinutes = action.payload;
      state.isPaused = false;
      state.sessionStartTime = new Date().toISOString();
      state.lastActiveTime = Date.now();
      state.isFullScreen = true; // Enter full-screen when starting meditation
    },
    pauseTimer: (state) => {
      state.isPaused = true;
      state.lastActiveTime = Date.now();
    },
    resumeTimer: (state) => {
      state.isPaused = false;
      state.lastActiveTime = Date.now();
    },
    stopTimer: (state) => {
      state.isActive = false;
      state.timeLeft = 0;
      state.isPaused = false;
      state.sessionStartTime = null;
      state.lastActiveTime = 0;
      state.isFullScreen = false; // Exit full-screen when stopping meditation
    },
    updateTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
      state.lastActiveTime = Date.now();
    },
    skipTime: (state, action: PayloadAction<number>) => {
      const newTime = Math.max(0, state.timeLeft + action.payload);
      state.timeLeft = newTime;
      state.lastActiveTime = Date.now();
      
      // If timer finished, update stats
      if (newTime === 0) {
        state.isActive = false;
        state.isPaused = false;
        state.sessionStartTime = null;
        state.totalSessions += 1;
        state.totalMinutes += state.selectedMinutes;
      }
    },
    setSelectedMinutes: (state, action: PayloadAction<number>) => {
      if (!state.isActive) {
        state.selectedMinutes = action.payload;
      }
    },
    completeSession: (state) => {
      state.isActive = false;
      state.timeLeft = 0;
      state.isPaused = false;
      state.sessionStartTime = null;
      state.lastActiveTime = 0;
      state.isFullScreen = false; // Exit full-screen when session completes
      state.fadeOutStarted = false; // Reset fade-out flag
      state.totalSessions += 1;
      state.totalMinutes += state.selectedMinutes;
    },
    setFadeOutStarted: (state, action: PayloadAction<boolean>) => {
      state.fadeOutStarted = action.payload;
    },
    syncTimerState: (state) => {
      // Sync timer state when returning to the tab
      if (state.isActive && !state.isPaused && state.sessionStartTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - new Date(state.sessionStartTime).getTime()) / 1000);
        const totalDuration = state.selectedMinutes * 60;
        const newTimeLeft = Math.max(0, totalDuration - elapsed);
        
        if (newTimeLeft === 0) {
          // Session completed while away
          state.isActive = false;
          state.isPaused = false;
          state.sessionStartTime = null;
          state.totalSessions += 1;
          state.totalMinutes += state.selectedMinutes;
        } else {
          state.timeLeft = newTimeLeft;
          state.lastActiveTime = now;
        }
      }
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  updateTimeLeft,
  skipTime,
  setSelectedMinutes,
  completeSession,
  syncTimerState,
  setFadeOutStarted,
} = meditationSlice.actions;

export default meditationSlice.reducer;
