import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ── GENERATE ──────────────────────────────────────────────────
export const generateItinerary = createAsyncThunk(
  "itineraries/generate",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/itineraries/generate", formData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate itinerary",
      );
    }
  },
);

// ── FETCH MY ITINERARIES ──────────────────────────────────────
export const fetchMyItineraries = createAsyncThunk(
  "itineraries/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/itineraries");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// ── FETCH SINGLE ──────────────────────────────────────────────
export const fetchItinerary = createAsyncThunk(
  "itineraries/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/itineraries/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// ── UPDATE ACTIVITY ───────────────────────────────────────────
export const updateActivity = createAsyncThunk(
  "itineraries/updateActivity",
  async ({ itineraryId, activityId, activityData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/itineraries/${itineraryId}/activities/${activityId}`,
        activityData,
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// ── UPDATE ITINERARY ──────────────────────────────────────────
export const updateItinerary = createAsyncThunk(
  "itineraries/update",
  async ({ id, data: updateData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/itineraries/${id}`, updateData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// ── DELETE ────────────────────────────────────────────────────
export const deleteItinerary = createAsyncThunk(
  "itineraries/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/itineraries/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// ── SLICE ──────────────────────────────────────────────────────
const itinerarySlice = createSlice({
  name: "itineraries",
  initialState: {
    itineraries: [],
    itinerary: null,
    loading: false,
    generating: false, // separate flag for AI generation (takes longer)
    error: null,
    success: false,
  },
  reducers: {
    clearItinerary: (state) => {
      state.itinerary = null;
    },
    clearItineraryState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // GENERATE
      .addCase(generateItinerary.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateItinerary.fulfilled, (state, action) => {
        state.generating = false;
        state.success = true;
        state.itinerary = action.payload.itinerary;
      })
      .addCase(generateItinerary.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })
      // FETCH LIST
      .addCase(fetchMyItineraries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyItineraries.fulfilled, (state, action) => {
        state.loading = false;
        state.itineraries = action.payload.itineraries;
      })
      .addCase(fetchMyItineraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH ONE
      .addCase(fetchItinerary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItinerary.fulfilled, (state, action) => {
        state.loading = false;
        state.itinerary = action.payload.itinerary;
      })
      .addCase(fetchItinerary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE ACTIVITY — update in place without refetching
      .addCase(updateActivity.fulfilled, (state, action) => {
        if (!state.itinerary) return;
        state.itinerary.ItineraryDays = state.itinerary.ItineraryDays.map(
          (day) => ({
            ...day,
            ItineraryActivities: day.ItineraryActivities.map((act) =>
              act.id === action.payload.activity.id
                ? action.payload.activity
                : act,
            ),
          }),
        );
      })
      // DELETE
      .addCase(deleteItinerary.fulfilled, (state, action) => {
        state.itineraries = state.itineraries.filter(
          (i) => i.id !== action.payload,
        );
      });
  },
});

export const { clearItinerary, clearItineraryState } = itinerarySlice.actions;
export default itinerarySlice.reducer;
