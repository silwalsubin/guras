import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationPreferences, Quote } from '@/services/quotesService';

export interface QuotesState {
  notificationPreferences: NotificationPreferences;
  currentQuote: Quote | null;
  recentQuotes: Quote[];
  isLoading: boolean;
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
  isLoading: false,
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
  },
});

export const {
  setNotificationPreferences,
  setCurrentQuote,
  addRecentQuote,
  setLoading,
  setError,
  clearError,
} = quotesSlice.actions;

export default quotesSlice.reducer;
