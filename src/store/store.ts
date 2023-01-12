import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import sliceApp from './slices/app';

export const store = configureStore({
  reducer: {
    app: sliceApp.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
