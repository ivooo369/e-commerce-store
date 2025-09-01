import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setUser, clearUser } from "./userSlice";
import { CartItem, CartState, ProductBase } from "./interfaces";
import { getStoredCart, setStoredCart, clearStoredCart } from "./storage";

const prepareProductForStore = (product: ProductBase): ProductBase => {
  if (!product) return product;

  const productCopy = JSON.parse(JSON.stringify(product));

  const ensureDateString = (date: Date): string | undefined => {
    if (!date) return undefined;
    if (date instanceof Date) return date.toISOString();
    if (typeof date === "string") {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date)) {
        return date;
      }
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
    }
    return undefined;
  };

  if (productCopy.createdAt) {
    productCopy.createdAt =
      ensureDateString(productCopy.createdAt) || new Date().toISOString();
  }
  if (productCopy.updatedAt) {
    productCopy.updatedAt =
      ensureDateString(productCopy.updatedAt) || new Date().toISOString();
  }

  return productCopy;
};

const initialState: CartState = {
  items: getStoredCart(),
  loading: false,
  error: null,
};

const saveCart = (items: CartItem[]) => {
  setStoredCart(items);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload.map((item) => ({
        ...item,
        product: prepareProductForStore(item.product),
      }));
      saveCart(
        state.items.map((item) => ({
          ...item,
          product: prepareProductForStore(item.product),
        }))
      );
    },
    addToCart: (
      state,
      action: PayloadAction<{ product: ProductBase; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;

      if (!product || !product.code) return;

      const existingItemIndex = state.items.findIndex(
        (item) => item.product?.code === product.code
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        const preparedProduct = prepareProductForStore(product);
        if (!preparedProduct) return;

        state.items.push({
          product: preparedProduct,
          quantity,
        });
      }

      saveCart(
        state.items.map((item) => ({
          ...item,
          product: prepareProductForStore(item.product),
        }))
      );
    },

    updateCartItem: (
      state,
      action: PayloadAction<{ productCode: string; quantity: number }>
    ) => {
      const { productCode, quantity } = action.payload;
      const itemIndex = state.items.findIndex(
        (item) => item.product?.code === productCode
      );

      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
        saveCart(
          state.items.map((item) => ({
            ...item,
            product: prepareProductForStore(item.product),
          }))
        );
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const productCode = action.payload;
      state.items = state.items.filter(
        (item) => item.product?.code !== productCode
      );
      saveCart(
        state.items.map((item) => ({
          ...item,
          product: prepareProductForStore(item.product),
        }))
      );
    },

    clearCart: (state, action: PayloadAction<string>) => {
      const customerId = action.payload;
      state.items = [];
      clearStoredCart();

      if (customerId) {
        import("@/services/cartService").then(({ cartService }) => {
          cartService.clearCart(customerId).catch((error) => {
            console.error(
              "Възникна грешка при изчистване на количката:",
              error
            );
          });
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setUser, (state) => {
      state.items = state.items.map((item) => ({
        ...item,
        product: prepareProductForStore(item.product),
      }));
      saveCart(
        state.items.map((item) => ({
          ...item,
          product: prepareProductForStore(item.product),
        }))
      );
    });
    builder.addCase(clearUser, (state) => {
      state.items = state.items.map((item) => ({
        ...item,
        product: prepareProductForStore(item.product),
      }));
      saveCart(
        state.items.map((item) => ({
          ...item,
          product: prepareProductForStore(item.product),
        }))
      );
    });
  },
});

export const {
  setCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
