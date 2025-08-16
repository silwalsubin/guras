import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const TAB_KEYS = {
  HOME: 'home',
  MEDITATION: 'meditation',
  AUDIO: 'audio',
  LEARN: 'learn',
  PROFILE: 'profile',
} as const;

export type TabKey = typeof TAB_KEYS[keyof typeof TAB_KEYS];

interface NavigationState {
  activeTab: TabKey;
}

const initialState: NavigationState = {
  activeTab: TAB_KEYS.HOME, // Changed from ACTIVITY to HOME as default
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<TabKey>) {
      state.activeTab = action.payload;
    },
    resetToHomeTab(state) {
      state.activeTab = TAB_KEYS.HOME;
    },
  },
});

export const { setActiveTab, resetToHomeTab } = navigationSlice.actions;
export default navigationSlice.reducer; 