import { configureStore } from '@reduxjs/toolkit';
import tripReducer from './tripSlice';
import authReducer from './authSlice';
import notificationsReducer from './notificationsSlice';
import bookingsReducer from './bookingsSlice';
import placesReducer from './placesSlice';

const store = configureStore({
  reducer: {
    trip: tripReducer,
    auth: authReducer,
    notifications: notificationsReducer,
    bookings: bookingsReducer,
    places: placesReducer,
  },
});

export default store;
