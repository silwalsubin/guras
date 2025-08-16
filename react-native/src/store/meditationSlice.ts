import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MeditationState {
  isActive: boolean;
  timeLeft: number;
  selectedMinutes: number;
  isPaused: boolean;
}

const initialState: MeditationState = {
  isActive: false,
  timeLeft: 0,
  selectedMinutes: 10,
  isPaused: false,
};

const meditationSlice = createSlice({
  name: 'meditation',
  initialState,
  reducers: {
    startTimer: (state, action: PayloadAction<number>) => {
      state.isActive = true;
      state.timeLeft = action.payload * 60;
      state.selectedMinutes = action.payload;
      state.isPaused = false;
    },
    pauseTimer: (state) => {
      state.isPaused = true;
    },
    resumeTimer: (state) => {
      state.isPaused = false;
    },
    stopTimer: (state) => {
      state.isActive = false;
      state.timeLeft = 0;
      state.isPaused = false;
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
} = meditationSlice.actions;

export default meditationSlice.reducer;
