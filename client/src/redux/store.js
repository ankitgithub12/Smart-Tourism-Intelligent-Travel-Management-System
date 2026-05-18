import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import placesReducer from './placesSlice';
import bookingsReducer from './bookingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placesReducer,
    bookings: bookingsReducer,
  },
});

export default store;
