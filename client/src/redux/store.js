import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import placesReducer from './placesSlice';
import bookingsReducer from './bookingsSlice';
import notificationsReducer from './notificationsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placesReducer,
    bookings: bookingsReducer,
    notifications: notificationsReducer,
  },
});

export default store;
