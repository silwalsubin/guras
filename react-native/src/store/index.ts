import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice';
import themeReducer from './themeSlice';
import quotesReducer from './quotesSlice';
import meditationReducer from './meditationSliceNew';
import guidedMeditationReducer from './guidedMeditationSlice';

const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    theme: themeReducer,
    quotes: quotesReducer,
    meditation: meditationReducer,
    guidedMeditation: guidedMeditationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { store };
export default store;