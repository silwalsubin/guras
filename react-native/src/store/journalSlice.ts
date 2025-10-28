import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { JournalEntry, CreateJournalEntryDto, UpdateJournalEntryDto } from '@/types/journal';
import { journalApi } from '@/api/journalApi';
import { journalGuidanceService } from '@/services/journalGuidanceService';

interface JournalState {
  entries: JournalEntry[];
  selectedEntry: JournalEntry | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: JournalState = {
  entries: [],
  selectedEntry: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchJournalEntries = createAsyncThunk(
  'journal/fetchEntries',
  async ({ userId, search }: { userId: string; search?: string }, { rejectWithValue }) => {
    try {
      const response = await journalApi.getEntries(userId, 1, 20, search);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch journal entries');
    }
  }
);

export const createJournalEntry = createAsyncThunk(
  'journal/createEntry',
  async (
    { userId, data }: { userId: string; data: CreateJournalEntryDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await journalApi.createEntry(userId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create journal entry');
    }
  }
);

export const updateJournalEntry = createAsyncThunk(
  'journal/updateEntry',
  async (
    { entryId, data }: { entryId: string; data: UpdateJournalEntryDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await journalApi.updateEntry(entryId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update journal entry');
    }
  }
);

export const deleteJournalEntry = createAsyncThunk(
  'journal/deleteEntry',
  async (entryId: string, { rejectWithValue }) => {
    try {
      await journalApi.deleteEntry(entryId);
      return entryId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete journal entry');
    }
  }
);

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    selectEntry: (state, action: PayloadAction<JournalEntry | null>) => {
      state.selectedEntry = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch entries
    builder
      .addCase(fetchJournalEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload;
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create entry
    builder
      .addCase(createJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries.unshift(action.payload);
        // Invalidate personalized guidance cache when new entry is created
        // We'll get the userId from the action if available, otherwise clear all
        if (action.meta.arg.userId) {
          journalGuidanceService.invalidateCacheOnNewEntry(action.meta.arg.userId);
        }
      })
      .addCase(createJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update entry
    builder
      .addCase(updateJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.entries.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        if (state.selectedEntry?.id === action.payload.id) {
          state.selectedEntry = action.payload;
        }
      })
      .addCase(updateJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete entry
    builder
      .addCase(deleteJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = state.entries.filter((e) => e.id !== action.payload);
        if (state.selectedEntry?.id === action.payload) {
          state.selectedEntry = null;
        }
      })
      .addCase(deleteJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectEntry, clearError } = journalSlice.actions;
export default journalSlice.reducer;

