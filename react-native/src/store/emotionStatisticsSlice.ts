import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { EmotionStatisticsResponse } from '@/types/journal';
import { journalApi } from '@/api/journalApi';

interface EmotionStatisticsState {
  data: EmotionStatisticsResponse | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

const initialState: EmotionStatisticsState = {
  data: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

// Async thunk to fetch emotion statistics
export const fetchEmotionStatistics = createAsyncThunk(
  'emotionStatistics/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await journalApi.getEmotionStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch emotion statistics');
    }
  }
);

const emotionStatisticsSlice = createSlice({
  name: 'emotionStatistics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.data = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmotionStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmotionStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchEmotionStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearData } = emotionStatisticsSlice.actions;
export default emotionStatisticsSlice.reducer;

