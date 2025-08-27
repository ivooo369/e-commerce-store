import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FavoritesState, Product } from "./interfaces";
import { sanitizeProduct, serializeProductDates } from "@/lib/sanitizeProduct";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favoriteService";

const initialState: FavoritesState = {
  products: [],
  loading: true,
  error: null,
};

export const loadFavorites = createAsyncThunk(
  "favorites/loadFavorites",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const favorites = await getFavorites(customerId);
      return favorites;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Възникна грешка при зареждане на любимите продукти!";
      return rejectWithValue(message);
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
      await addFavorite(customerId, product.id);
      return serializeProductDates(product);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Възникна грешка при добавяне на продукта в 'Любими'!";
      return rejectWithValue(message);
    }
  }
);

export const removeFavoriteFromServer = createAsyncThunk(
  "favorites/removeFavoriteFromServer",
  async (
    { productId, customerId }: { productId?: string; customerId: string },
    { rejectWithValue }
  ) => {
    if (!productId) {
      return rejectWithValue("Невалиден идентификатор на продукт");
    }
    try {
      await removeFavorite(customerId, productId);
      return productId;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Възникна грешка при премахване на продукта от 'Любими'!";
      return rejectWithValue(message);
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
        state.products = Array.isArray(action.payload)
          ? action.payload.map((product) =>
              sanitizeProduct(serializeProductDates(product))
            )
          : [];
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
        const product = action.payload;
        const sanitizedProduct = sanitizeProduct(
          serializeProductDates(product)
        );

        if (!state.products.some((p) => p.id === sanitizedProduct.id)) {
          state.products.push(sanitizedProduct);
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
