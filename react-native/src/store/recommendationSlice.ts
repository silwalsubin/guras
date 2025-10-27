import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/api';

export interface MeditationRecommendation {
  title: string;
  theme: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  reason: string;
}

interface RecommendationState {
  recommendations: MeditationRecommendation[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  cacheExpiry: number; // Cache for 1 hour (3600000 ms)
}

const initialState: RecommendationState = {
  recommendations: [],
  loading: false,
  error: null,
  lastFetchTime: null,
  cacheExpiry: 3600000, // 1 hour
};

// Async thunk to fetch recommendations
export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetchRecommendations',
  async (count: number = 3, { rejectWithValue }) => {
    try {
      console.log('Fetching recommendations with count:', count);

      const response = await apiService.getPersonalizedRecommendations(count);

      if (!response.success) {
        console.error('Failed to fetch recommendations:', response.error);
        return rejectWithValue(response.error?.message || 'Failed to fetch recommendations');
      }

      console.log('Successfully fetched recommendations:', response.data?.length);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch recommendations'
      );
    }
  }
);

// Async thunk to fetch recommendation reason
export const fetchRecommendationReason = createAsyncThunk(
  'recommendations/fetchRecommendationReason',
  async (sessionTitle: string, { rejectWithValue }) => {
    try {
      console.log('Fetching recommendation reason for:', sessionTitle);

      const response = await apiService.getRecommendationReason(sessionTitle);

      if (!response.success) {
        console.error('Failed to fetch recommendation reason:', response.error);
        return rejectWithValue(response.error?.message || 'Failed to fetch reason');
      }

      console.log('Successfully fetched recommendation reason');
      return response.data?.reason || 'Personalized for you';
    } catch (error) {
      console.error('Error fetching recommendation reason:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch reason'
      );
    }
  }
);

// Async thunk to fetch recommendations by time
export const fetchRecommendationsByTime = createAsyncThunk(
  'recommendations/fetchRecommendationsByTime',
  async (
    { timeOfDay, count }: { timeOfDay: string; count?: number },
    { rejectWithValue }
  ) => {
    try {
      console.log('Fetching recommendations for time:', timeOfDay);

      const response = await apiService.getRecommendationsByTime(timeOfDay, count || 3);

      if (!response.success) {
        console.error('Failed to fetch recommendations by time:', response.error);
        return rejectWithValue(response.error?.message || 'Failed to fetch recommendations');
      }

      console.log('Successfully fetched recommendations by time');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recommendations by time:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch recommendations'
      );
    }
  }
);

// Async thunk to fetch recommendations by emotion
export const fetchRecommendationsByEmotion = createAsyncThunk(
  'recommendations/fetchRecommendationsByEmotion',
  async (
    { emotionalState, count }: { emotionalState: string; count?: number },
    { rejectWithValue }
  ) => {
    try {
      console.log('Fetching recommendations for emotion:', emotionalState);

      const response = await apiService.getRecommendationsByEmotion(emotionalState, count || 3);

      if (!response.success) {
        console.error('Failed to fetch recommendations by emotion:', response.error);
        return rejectWithValue(response.error?.message || 'Failed to fetch recommendations');
      }

      console.log('Successfully fetched recommendations by emotion');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recommendations by emotion:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch recommendations'
      );
    }
  }
);

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.recommendations = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch recommendations
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
        state.lastFetchTime = Date.now();
        state.error = null;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.recommendations = [];
      });

    // Fetch recommendations by time
    builder
      .addCase(fetchRecommendationsByTime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendationsByTime.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
        state.lastFetchTime = Date.now();
        state.error = null;
      })
      .addCase(fetchRecommendationsByTime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.recommendations = [];
      });

    // Fetch recommendations by emotion
    builder
      .addCase(fetchRecommendationsByEmotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendationsByEmotion.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
        state.lastFetchTime = Date.now();
        state.error = null;
      })
      .addCase(fetchRecommendationsByEmotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.recommendations = [];
      });
  },
});

export const { clearRecommendations, clearError } = recommendationSlice.actions;
export default recommendationSlice.reducer;

