import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tripData: {
    from_location: '',
    to_destination: '',
    departure_date: '',
    return_date: '',
    travelers: 2,
    budget: 50000,
  },
  selections: {
    hotel: null,
    food: null,
    cab: null,
    guide: null,
    vehicle: null,
  },
  loading: false,
  error: null,
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setTripData: (state, action) => {
      state.tripData = { ...state.tripData, ...action.payload };
    },
    setSelection: (state, action) => {
      const { type, data } = action.payload;
      state.selections[type] = data;
    },
    clearTrip: (state) => {
      return initialState;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const { setTripData, setSelection, clearTrip, setLoading, setError } = tripSlice.actions;

export default tripSlice.reducer;
