import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import tourReducer from "./slices/tourSlice";
import bookingReducer from "./slices/bookingSlice";
import reviewReducer from "./slices/reviewSlice";
import adminReducer from "./slices/adminSlice";
import itineraryReducer from "./slices/itinerarySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer, // user login state, token
    tours: tourReducer, // tour list, single tour, loading
    bookings: bookingReducer, // user bookings, booking status
    reviews: reviewReducer, // tour reviews
    admin: adminReducer,  // admin dashboard stats, booking management
    itineraries: itineraryReducer,
  },
});
