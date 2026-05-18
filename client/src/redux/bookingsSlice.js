import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingsAPI } from '../services/api';

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.getAll();
      return response.data.data || response.data; // Handle paginated or unpaginated
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.create(bookingData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.cancel(id);
      return { id, payment_status: response.data.payment_status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    userBookings: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearBookingMessages(state) {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Booking created successfully!';
        if (action.payload.booking) {
            state.userBookings.unshift(action.payload.booking);
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.userBookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.userBookings[index].status = 'cancelled';
          state.userBookings[index].payment_status = action.payload.payment_status;
        }
      });
  },
});

export const { clearBookingMessages } = bookingsSlice.actions;
export default bookingsSlice.reducer;
