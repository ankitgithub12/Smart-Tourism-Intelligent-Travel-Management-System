import { configureStore } from '@reduxjs/toolkit';
import tripReducer from './tripSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    trip: tripReducer,
    auth: authReducer,
  },
});

export default store;
