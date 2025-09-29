import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import favoritesReducer from "./slices/favoriteSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
