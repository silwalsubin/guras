import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice';

const store = configureStore({
  reducer: {
    navigation: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 