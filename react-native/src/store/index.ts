import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice';
import musicPlayerReducer from './musicPlayerSlice';

const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    musicPlayer: musicPlayerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 