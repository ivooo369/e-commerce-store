import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import favoritesReducer from "./favoriteSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
