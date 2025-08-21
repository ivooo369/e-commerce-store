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
      const response = await fetch(`/api/public/favorites?customerId=${customerId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch favorites');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Възникна грешка при зареждане на любимите продукти!"
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
      const response = await fetch('/api/public/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, productId: product.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add favorite');
      }

      return product;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Възникна грешка при добавяне на продукта в 'Любими'!"
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
      const response = await fetch('/api/public/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove favorite');
      }

      return productId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Грешка при премахване на любим продукт"
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
