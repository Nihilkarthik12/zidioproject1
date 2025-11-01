import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chartReducer from './slices/chartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    charts: chartReducer,
  },
});
