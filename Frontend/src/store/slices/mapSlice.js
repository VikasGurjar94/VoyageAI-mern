import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// geocode a list of activity locations
export const geocodeLocations = createAsyncThunk(
  "map/geocodeMany",
  async (locations, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/maps/geocode-many", { locations });
      return data.results;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// fetch nearby places for a clicked marker
export const fetchNearbyPlaces = createAsyncThunk(
  "map/fetchNearby",
  async ({ lat, lng, type, radius = 1000 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/maps/nearby", {
        params: { lat, lng, type, radius },
      });
      return { places: data.places, type };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const mapSlice = createSlice({
  name: "map",
  initialState: {
    // array of { location, lat, lng, found, activity info }
    markers: [],
    nearbyPlaces: [],
    nearbyType: "restaurant",
    selectedMarker: null,
    loading: false,
    nearbyLoading: false,
    error: null,
  },
  reducers: {
    setSelectedMarker: (state, action) => {
      state.selectedMarker = action.payload;
    },
    clearMapState: (state) => {
      state.markers = [];
      state.nearbyPlaces = [];
      state.selectedMarker = null;
    },
    setNearbyType: (state, action) => {
      state.nearbyType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(geocodeLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(geocodeLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.markers = action.payload.filter((r) => r.found);
      })
      .addCase(geocodeLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNearbyPlaces.pending, (state) => {
        state.nearbyLoading = true;
      })
      .addCase(fetchNearbyPlaces.fulfilled, (state, action) => {
        state.nearbyLoading = false;
        state.nearbyPlaces = action.payload.places;
        state.nearbyType = action.payload.type;
      })
      .addCase(fetchNearbyPlaces.rejected, (state, action) => {
        state.nearbyLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedMarker, clearMapState, setNearbyType } =
  mapSlice.actions;
export default mapSlice.reducer;
