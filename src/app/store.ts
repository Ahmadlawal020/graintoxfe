import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../services/api/apiSlice";
import authReducer from "../services/authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";

// Infer the RootState type from the store itself
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // RTK Query API slice
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware), // Add RTK Query middleware
  devTools: false, // Enable Redux DevTools
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
