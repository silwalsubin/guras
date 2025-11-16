import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { EmotionStatisticsResponse } from '@/types/journal';
import { journalApi } from '@/api/journalApi';
import { DateRangeOption, getDefaultDateRange } from '@/constants/dateRanges';

interface EmotionStatisticsState {
  data: EmotionStatisticsResponse | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
  selectedDateRange: DateRangeOption;
}

const initialState: EmotionStatisticsState = {
  data: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  selectedDateRange: getDefaultDateRange(),
};

// Async thunk to fetch emotion statistics with optional date range
export const fetchEmotionStatistics = createAsyncThunk(
  'emotionStatistics/fetch',
  async (
    params?: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await journalApi.getEmotionStatistics(
        params?.startDate,
        params?.endDate
      );
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
    setSelectedDateRange: (state, action) => {
      state.selectedDateRange = action.payload;
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

export const { clearError, clearData, setSelectedDateRange } = emotionStatisticsSlice.actions;
export default emotionStatisticsSlice.reducer;

