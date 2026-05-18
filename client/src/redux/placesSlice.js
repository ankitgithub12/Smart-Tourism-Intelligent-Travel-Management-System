import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { placesAPI } from '../services/api';

export const fetchPlaces = createAsyncThunk(
  'places/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await placesAPI.getAll(filters);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch places');
    }
  }
);

export const fetchPlaceDetails = createAsyncThunk(
  'places/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await placesAPI.getOne(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch place details');
    }
  }
);

const placesSlice = createSlice({
  name: 'places',
  initialState: {
    list: [],
    pagination: null,
    selectedPlace: null,
    loading: false,
    error: null,
    filters: {
      category: 'All',
      q: '',
      rating_min: null,
      crowd_max: null,
      location: '',
      sort: 'rating'
    }
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {
        category: 'All',
        q: '',
        rating_min: null,
        crowd_max: null,
        location: '',
        sort: 'rating'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.loading = false;
        // Handle pagination response structure
        if (action.payload.data) {
           state.list = action.payload.data;
           state.pagination = {
             current_page: action.payload.current_page,
             last_page: action.payload.last_page,
             total: action.payload.total,
           };
        } else {
           state.list = action.payload; // Fallback if no pagination
        }
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlaceDetails.pending, (state) => {
        state.loading = true;
        state.selectedPlace = null;
      })
      .addCase(fetchPlaceDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPlace = action.payload;
      })
      .addCase(fetchPlaceDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = placesSlice.actions;
export default placesSlice.reducer;
