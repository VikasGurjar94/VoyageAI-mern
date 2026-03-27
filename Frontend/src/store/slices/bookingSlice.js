import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const createBooking = createAsyncThunk(
  "bookings/create",
  async (bookingData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/bookings", bookingData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/bookings/my-bookings");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const cancelBooking = createAsyncThunk(
  "bookings/cancel",
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    bookings: [],
    booking: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearBookingState: (state) => {
      state.error = null;
      state.success = false;
      state.booking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.booking = action.payload.booking;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        // update status in local state immediately without refetching
        const booking = state.bookings.find((b) => b.id === action.payload);
        if (booking) booking.status = "cancelled";
      });
  },
});

export const { clearBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
