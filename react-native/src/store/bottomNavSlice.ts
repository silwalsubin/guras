import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BottomNavState {
  isHidden: boolean;
  journalCreateOpen: boolean;
}

const initialState: BottomNavState = {
  isHidden: false,
  journalCreateOpen: false,
};

const bottomNavSlice = createSlice({
  name: 'bottomNav',
  initialState,
  reducers: {
    hideBottomNav(state) {
      state.isHidden = true;
    },
    showBottomNav(state) {
      state.isHidden = false;
    },
    setBottomNavVisibility(state, action: PayloadAction<boolean>) {
      state.isHidden = !action.payload; // true = visible, false = hidden
    },
    setJournalCreateOpen(state, action: PayloadAction<boolean>) {
      state.journalCreateOpen = action.payload;
    },
  },
});

export const { hideBottomNav, showBottomNav, setBottomNavVisibility, setJournalCreateOpen } = bottomNavSlice.actions;
export default bottomNavSlice.reducer;
