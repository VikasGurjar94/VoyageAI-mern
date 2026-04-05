import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const addExpense = createAsyncThunk(
  "expenses/add",
  async (expenseData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/expenses", expenseData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add expense",
      );
    }
  },
);

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchAll",
  async (itineraryId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/expenses/itinerary/${itineraryId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchSummary = createAsyncThunk(
  "expenses/fetchSummary",
  async (itineraryId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/expenses/itinerary/${itineraryId}/summary`,
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateExpense = createAsyncThunk(
  "expenses/update",
  async ({ id, expenseData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/expenses/${id}`, expenseData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteExpense = createAsyncThunk(
  "expenses/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/expenses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const importPlanned = createAsyncThunk(
  "expenses/importPlanned",
  async (itineraryId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/expenses/itinerary/${itineraryId}/import-planned`,
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState: {
    expenses: [],
    summary: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearExpenseState: (state) => {
      state.error = null;
      state.success = false;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ADD
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.expenses.push(action.payload.expense);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH LIST
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH SUMMARY
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.map((e) =>
          e.id === action.payload.expense.id ? action.payload.expense : e,
        );
      })
      // DELETE
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      })
      // IMPORT PLANNED
      .addCase(importPlanned.pending, (state) => {
        state.loading = true;
      })
      .addCase(importPlanned.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(importPlanned.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearExpenseState, clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
