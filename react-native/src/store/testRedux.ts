import { createSlice } from '@reduxjs/toolkit';

// Simple test slice
const testSlice = createSlice({
  name: 'test',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
  },
});

// Test the actions
const actions = testSlice.actions;
console.log('Actions created:', actions);
console.log('increment type:', typeof actions.increment);
console.log('increment function:', actions.increment);

export const { increment } = testSlice.actions;
export default testSlice.reducer;
