// store/ngoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunk for fetching NGO details
export const fetchNgoDetails = createAsyncThunk(
  'ngo/fetchNgoDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_NgoInformationApi}?type=registration&orgName=${id}`
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return rejectWithValue('Invalid response format');
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const ngoSlice = createSlice({
  name: 'ngo',
  initialState: {
    ngoDetails: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNgoDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNgoDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ngoDetails = action.payload;
      })
      .addCase(fetchNgoDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default ngoSlice.reducer;
