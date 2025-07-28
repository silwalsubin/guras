import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice';
import musicPlayerReducer from './musicPlayerSlice';
import themeReducer from './themeSlice';

const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    musicPlayer: musicPlayerReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 