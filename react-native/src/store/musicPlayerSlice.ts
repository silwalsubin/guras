import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioFile } from '@/services/api';

interface Progress {
  position: number;
  duration: number;
  buffered: number;
}

interface CurrentTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  artworkUrl?: string | null;
}

interface MusicPlayerState {
  isPlaying: boolean;
  progress: Progress;
  sliderPosition: number;
  sliderValue: number;
  pendingSeek: number | null;
  isSliding: boolean;
  audioFiles: AudioFile[];
  currentTrackIndex: number;
  currentTrack: CurrentTrack | null;
  loading: boolean;
}

const initialState: MusicPlayerState = {
  isPlaying: false,
  progress: { position: 0, duration: 0, buffered: 0 },
  sliderPosition: 0,
  sliderValue: 0,
  pendingSeek: null,
  isSliding: false,
  audioFiles: [],
  currentTrackIndex: 0,
  currentTrack: null,
  loading: false,
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
    setSliderValue(state, action: PayloadAction<number>) {
      state.sliderValue = action.payload;
    },
    setPendingSeek(state, action: PayloadAction<number | null>) {
      state.pendingSeek = action.payload;
    },
    setIsSliding(state, action: PayloadAction<boolean>) {
      state.isSliding = action.payload;
    },
    setAudioFiles(state, action: PayloadAction<AudioFile[]>) {
      state.audioFiles = action.payload;
    },
    setCurrentTrackIndex(state, action: PayloadAction<number>) {
      state.currentTrackIndex = action.payload;
    },
    setCurrentTrack(state, action: PayloadAction<CurrentTrack | null>) {
      state.currentTrack = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    nextTrack(state) {
      if (state.audioFiles.length > 0) {
        const nextIndex = (state.currentTrackIndex + 1) % state.audioFiles.length;
        state.currentTrackIndex = nextIndex;
      }
    },
    previousTrack(state) {
      if (state.audioFiles.length > 0) {
        const prevIndex = state.currentTrackIndex === 0 ? state.audioFiles.length - 1 : state.currentTrackIndex - 1;
        state.currentTrackIndex = prevIndex;
      }
    },
  },
});

export const { 
  setIsPlaying, 
  setProgress, 
  setSliderPosition, 
  setSliderValue,
  setPendingSeek,
  setIsSliding,
  setAudioFiles,
  setCurrentTrackIndex,
  setCurrentTrack,
  setLoading,
  nextTrack,
  previousTrack
} = musicPlayerSlice.actions;

export default musicPlayerSlice.reducer; 