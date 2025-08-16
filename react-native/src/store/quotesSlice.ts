import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Quote } from '@/services/quotesService';
import quotesService from '@/services/quotesService';

// Async thunk for loading quotes
export const fetchQuotes = createAsyncThunk(
  'quotes/fetchQuotes',
  async (_, { rejectWithValue }) => {
    try {
      const quotes = await quotesService.getAllQuotes();
      return quotes;
    } catch (error) {
      return rejectWithValue('Failed to fetch quotes');
    }
  }
);

// Define notification preferences interface here since it was removed from quotesService
export interface NotificationPreferences {
  enabled: boolean;
  frequency: '5min' | 'hourly' | 'daily' | 'twice-daily';
  quietHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export interface QuotesState {
  notificationPreferences: NotificationPreferences;
  currentQuote: Quote | null;
  recentQuotes: Quote[];
  allQuotes: Quote[];
  likedQuotes: string[]; // Changed from Set to array for Redux serialization
  likeCounts: Record<string, number>;
  commentCounts: Record<string, number>;
  isLoading: boolean;
  isRefreshing: boolean; // New state for pull-to-refresh
  error: string | null;
}

const initialState: QuotesState = {
  notificationPreferences: {
    enabled: true,
    frequency: 'daily',
    quietHours: { start: '22:00', end: '08:00' }
  },
  currentQuote: null,
  recentQuotes: [],
  allQuotes: [],
  likedQuotes: [], // Changed from Set to array
  likeCounts: {},
  commentCounts: {},
  isLoading: false,
  isRefreshing: false, // New state for pull-to-refresh
  error: null,
};

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    setNotificationPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.notificationPreferences = action.payload;
    },
    setCurrentQuote: (state, action: PayloadAction<Quote>) => {
      state.currentQuote = action.payload;
    },
    addRecentQuote: (state, action: PayloadAction<Quote>) => {
      // Add to beginning of array and keep only last 10
      state.recentQuotes.unshift(action.payload);
      if (state.recentQuotes.length > 10) {
        state.recentQuotes = state.recentQuotes.slice(0, 10);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleLike: (state, action: PayloadAction<Quote>) => {
      const quoteKey = `${action.payload.text}-${action.payload.author}`;
      if (state.likedQuotes.includes(quoteKey)) { // Changed from .has to .includes
        state.likedQuotes = state.likedQuotes.filter(key => key !== quoteKey); // Changed from .delete to .filter
        state.likeCounts[quoteKey] = (state.likeCounts[quoteKey] || 1) - 1;
      } else {
        state.likedQuotes.push(quoteKey); // Changed from .add to .push
        state.likeCounts[quoteKey] = (state.likeCounts[quoteKey] || 0) + 1;
      }
    },
    setLikeCounts: (state, action: PayloadAction<Record<string, number>>) => {
      state.likeCounts = action.payload;
    },
    setCommentCounts: (state, action: PayloadAction<Record<string, number>>) => {
      state.commentCounts = action.payload;
    },
    setAllQuotes: (state, action: PayloadAction<Quote[]>) => {
      state.allQuotes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotes.pending, (state) => {
        // Only set loading to true if we're not already refreshing
        if (!state.isRefreshing) {
          state.isLoading = true;
        }
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.allQuotes = action.payload;
        
        // Initialize like and comment counts for each quote
        const initialLikeCounts: Record<string, number> = {};
        const initialCommentCounts: Record<string, number> = {};
        
        action.payload.forEach(quote => {
          const quoteKey = `${quote.text}-${quote.author}`;
          initialLikeCounts[quoteKey] = Math.floor(Math.random() * 50) + 10; // Random like count between 10-60
          initialCommentCounts[quoteKey] = Math.floor(Math.random() * 20) + 1; // Random comment count between 1-21
        });
        
        state.likeCounts = initialLikeCounts;
        state.commentCounts = initialCommentCounts;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setNotificationPreferences,
  setCurrentQuote,
  addRecentQuote,
  setLoading,
  setError,
  clearError,
  toggleLike,
  setLikeCounts,
  setCommentCounts,
  setAllQuotes,
} = quotesSlice.actions;

export default quotesSlice.reducer;
