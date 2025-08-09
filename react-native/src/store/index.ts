import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice';
import musicPlayerReducer from './musicPlayerSlice';
import themeReducer from './themeSlice';
import quotesReducer from './quotesSlice';

const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    musicPlayer: musicPlayerReducer,
    theme: themeReducer,
    quotes: quotesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 