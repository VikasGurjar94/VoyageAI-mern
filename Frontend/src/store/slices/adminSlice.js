import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ── FETCH DASHBOARD STATS ─────────────────────────────────
export const fetchDashboardStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch tours and bookings in parallel
      const [toursRes, bookingsRes] = await Promise.all([
        api.get("/tours", { params: { limit: 1000 } }),
        api.get("/bookings", { params: { limit: 1000 } }),
      ]);
      const tours = toursRes.data;
      const bookings = bookingsRes.data;

      const totalRevenue = bookings.bookings?.reduce(
        (sum, b) => sum + parseFloat(b.total_price || 0),
        0
      ) || 0;

      const pending = bookings.bookings?.filter(
        (b) => b.status === "pending"
      ).length || 0;

      return {
        totalTours: tours.total || 0,
        totalBookings: bookings.total || 0,
        pendingBookings: pending,
        totalRevenue,
        recentBookings: (bookings.bookings || []).slice(0, 5),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ── FETCH ALL BOOKINGS (ADMIN) ────────────────────────────
export const fetchAllBookingsAdmin = createAsyncThunk(
  "admin/fetchBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/bookings", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ── UPDATE BOOKING STATUS ─────────────────────────────────
export const updateBookingStatusAdmin = createAsyncThunk(
  "admin/updateBookingStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/bookings/${id}/status`, { status });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats: null,
    bookings: [],
    total: 0,
    pages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllBookingsAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllBookingsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchAllBookingsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBookingStatusAdmin.fulfilled, (state, action) => {
        // update booking in local state
        const idx = state.bookings.findIndex(
          (b) => b.id === action.payload.booking?.id
        );
        if (idx !== -1) state.bookings[idx] = action.payload.booking;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
