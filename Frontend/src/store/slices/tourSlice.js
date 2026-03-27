import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchTours = createAsyncThunk(
  "tours/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // params = { destination, minPrice, maxPrice, page, sort }
      const { data } = await api.get("/tours", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchTourById = createAsyncThunk(
  "tours/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tours/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const createTour = createAsyncThunk(
  "tours/create",
  async (formData, { rejectWithValue }) => {
    try {
      // formData is FormData object (for image upload)
      const { data } = await api.post("/tours", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateTour = createAsyncThunk(
  "tours/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/tours/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteTour = createAsyncThunk(
  "tours/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tours/${id}`);
      return id; // return id so we can remove it from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const tourSlice = createSlice({
  name: "tours",
  initialState: {
    tours: [],
    tour: null, // single tour being viewed
    total: 0,
    pages: 1,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearTour: (state) => {
      state.tour = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTours.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTours.fulfilled, (state, action) => {
        state.loading = false;
        state.tours = action.payload.tours;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTourById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTourById.fulfilled, (state, action) => {
        state.loading = false;
        state.tour = action.payload.tour;
      })
      .addCase(fetchTourById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTour.fulfilled, (state, action) => {
        state.tours.unshift(action.payload.tour); // add to top of list
      })
      .addCase(deleteTour.fulfilled, (state, action) => {
        // remove deleted tour from local state immediately
        state.tours = state.tours.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearTour } = tourSlice.actions;
export default tourSlice.reducer;
