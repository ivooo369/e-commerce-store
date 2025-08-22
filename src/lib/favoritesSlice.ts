import axios, { AxiosError } from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FavoritesState, Product } from "./interfaces";

const initialState: FavoritesState = {
  products: [],
  loading: true,
  error: null,
};

export const loadFavorites = createAsyncThunk(
  "favorites/loadFavorites",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/public/favorites`, {
        params: { customerId },
      });
      return data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Възникна грешка при зареждане на любимите продукти!"
      );
    }
  }
);

export const addFavoriteToServer = createAsyncThunk(
  "favorites/addFavoriteToServer",
  async (
    { product, customerId }: { product: Product; customerId: string },
    { rejectWithValue }
  ) => {
    if (!product.id) {
      return rejectWithValue("Невалиден продукт: липсва ID");
    }

    try {
      await axios.post(`/api/public/favorites`, {
        customerId,
        productId: product.id,
      });
      return product;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Възникна грешка при добавяне на продукта в 'Любими'!"
      );
    }
  }
);

export const removeFavoriteFromServer = createAsyncThunk(
  "favorites/removeFavoriteFromServer",
  async (
    { productId, customerId }: { productId: string; customerId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`/api/public/favorites`, {
        data: { customerId, productId },
      });
      return productId;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Грешка при премахване на любим продукт"
      );
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addFavoriteToServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavoriteToServer.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.products.some((p) => p.id === action.payload.id)) {
          state.products.push(action.payload);
        }
      })
      .addCase(addFavoriteToServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeFavoriteFromServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavoriteFromServer.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
      })
      .addCase(removeFavoriteFromServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFavorites, clearError } = favoritesSlice.actions;
export default favoritesSlice.reducer;
