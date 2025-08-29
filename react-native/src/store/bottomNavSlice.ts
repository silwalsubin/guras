import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BottomNavState {
  isHidden: boolean;
}

const initialState: BottomNavState = {
  isHidden: false,
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
  },
});

export const { hideBottomNav, showBottomNav, setBottomNavVisibility } = bottomNavSlice.actions;
export default bottomNavSlice.reducer;
