import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FavoritesState, Product } from "./interfaces";
import { sanitizeProduct, serializeProductDates } from "@/lib/sanitizeProduct";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favoriteService";

const convertDatesToISO = <T>(obj: T): T => {
  if (obj === null || obj === undefined) return obj as T;
  if (typeof obj !== "object") return obj as T;

  if (Array.isArray(obj)) {
    return obj.map((item) => convertDatesToISO(item)) as unknown as T;
  }

  const objRecord = obj as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const key in objRecord) {
    if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
      const value = objRecord[key];

      if (value instanceof Date) {
        result[key] = value.toISOString();
      } else if (typeof value === "object" && value !== null) {
        result[key] = convertDatesToISO(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
};

const deepSerializeProduct = <T>(product: T): T => {
  if (!product) return product;

  const productCopy = JSON.parse(JSON.stringify(product));

  return convertDatesToISO(productCopy) as T;
};

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
      return deepSerializeProduct(product);
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
      return rejectWithValue("Невалиден идентификатор на продукт!");
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
    setFavorites: (state, action) => {
      state.products = action.payload.products;
      state.loading = action.payload.loading;
      state.error = action.payload.error;
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
          ? action.payload.map((product) => {
              const serialized = deepSerializeProduct(product);
              return sanitizeProduct(serializeProductDates(serialized));
            })
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
        const serializedProduct = deepSerializeProduct(product);
        const sanitizedProduct = sanitizeProduct(
          serializeProductDates(serializedProduct)
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
