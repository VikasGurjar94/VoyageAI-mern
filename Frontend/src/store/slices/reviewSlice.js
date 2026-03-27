import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ── FETCH REVIEWS ─────────────────────────────────────────
export const fetchReviews = createAsyncThunk(
  "reviews/fetchAll",
  async (tourId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tours/${tourId}/reviews`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ── SUBMIT REVIEW ─────────────────────────────────────────
export const submitReview = createAsyncThunk(
  "reviews/submit",
  async ({ tourId, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/tours/${tourId}/reviews`, {
        rating,
        comment,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    loading: false,
    error: null,
    submitSuccess: false,
  },
  reducers: {
    clearReviewState: (state) => {
      state.error = null;
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.submitSuccess = true;
        state.reviews.unshift(action.payload.review);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
