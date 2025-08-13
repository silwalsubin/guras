import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const TAB_KEYS = {
  HOME: 'home',
  ACTIVITY: 'activity',
  AUDIO: 'audio',
  LEARN: 'learn',
  PROFILE: 'profile',
} as const;

export type TabKey = typeof TAB_KEYS[keyof typeof TAB_KEYS];

interface NavigationState {
  activeTab: TabKey;
}

const initialState: NavigationState = {
  activeTab: TAB_KEYS.ACTIVITY,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<TabKey>) {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = navigationSlice.actions;
export default navigationSlice.reducer; 