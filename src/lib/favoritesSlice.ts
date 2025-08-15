import { createSlice, PayloadAction, createAction } from "@reduxjs/toolkit";
import { FavoritesState, Product } from "./interfaces";

const initialState: FavoritesState = {
  products: [],
};
export const setAllFavorites = createAction<Product[]>(
  "favorites/setAllFavorites"
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<Product>) => {
      if (!state.products.find((p) => p.code === action.payload.code)) {
        state.products.push(action.payload);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "favoriteProducts",
            JSON.stringify(state.products)
          );
        }
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.code !== action.payload);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "favoriteProducts",
          JSON.stringify(state.products)
        );
      }
    },
    toggleFavorite: (state, action: PayloadAction<Product>) => {
      const exists = state.products.find((p) => p.code === action.payload.code);
      if (exists) {
        state.products = state.products.filter(
          (p) => p.code !== action.payload.code
        );
      } else {
        state.products.push(action.payload);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "favoriteProducts",
          JSON.stringify(state.products)
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setAllFavorites, (state, action) => {
      state.products = action.payload;
    });
  },
});

export const { addFavorite, removeFavorite, toggleFavorite } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;
