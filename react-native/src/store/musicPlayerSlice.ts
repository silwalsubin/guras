import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Progress {
  position: number;
  duration: number;
  buffered: number;
}

interface MusicPlayerState {
  isPlaying: boolean;
  progress: Progress;
  sliderPosition: number;
}

const initialState: MusicPlayerState = {
  isPlaying: false,
  progress: { position: 0, duration: 0, buffered: 0 },
  sliderPosition: 0,
};

const musicPlayerSlice = createSlice({
  name: 'musicPlayer',
  initialState,
  reducers: {
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setProgress(state, action: PayloadAction<Progress>) {
      state.progress = action.payload;
    },
    setSliderPosition(state, action: PayloadAction<number>) {
      state.sliderPosition = action.payload;
    },
  },
});

export const { setIsPlaying, setProgress, setSliderPosition } = musicPlayerSlice.actions;
export default musicPlayerSlice.reducer; 