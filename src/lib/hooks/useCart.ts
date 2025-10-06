import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/types/types";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  setCartItems,
} from "@/lib/store/slices/cartSlice";
import { useCallback, useEffect, useRef } from "react";
import { ProductBase, CartItem } from "@/lib/types/interfaces";
import { sanitizeProduct } from "@/lib/utils/sanitizeProduct";
import { cartService } from "@/services/cartService";
import { fetchProductByCode } from "@/services/productService";

const prepareProduct = (product: ProductBase): ProductBase => {
  if (!product) return product;
  try {
    const productCopy = JSON.parse(JSON.stringify(product));
    return sanitizeProduct(productCopy);
  } catch {
    return product;
  }
};

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.cart
  );
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const { id: userId } = useSelector((state: RootState) => state.user);
  const localMutationAtRef = useRef<number>(0);

  const validateCartItems = useCallback(async (cartItems: CartItem[]) => {
    if (!cartItems || !cartItems.length) return [];

    try {
      const validatedItems = [];

      for (const item of cartItems) {
        try {
          if (!item?.product?.code) continue;

          await fetchProductByCode(item.product.code);
          validatedItems.push(item);
        } catch {
          throw new Error("Възникна грешка при валидиране на продукта!");
        }
      }

      return validatedItems;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isLoggedIn) return;

    const loadAndValidateCart = async () => {
      try {
        const storedCart = localStorage.getItem("cart");
        if (!storedCart) return;

        const parsedCart = JSON.parse(storedCart);
        if (!Array.isArray(parsedCart)) return;

        const validItems = await validateCartItems(parsedCart);

        if (validItems.length !== parsedCart.length) {
          dispatch(setCartItems(validItems));
        }
      } catch {
        throw new Error("Възникна грешка при валидиране на количката!");
      }
    };

    loadAndValidateCart();
  }, [isLoggedIn, dispatch, validateCartItems]);

  useEffect(() => {
    const hydrateFromServer = async () => {
      if (!isLoggedIn || !userId) return;
      const hydrateStart = Date.now();
      try {
        const serverItems = await cartService.getCartItems(userId);
        if (localMutationAtRef.current > hydrateStart) return;
        dispatch(setCartItems(serverItems));
      } catch {
        throw new Error(
          "Възникна грешка при зареждане на количката от сървъра!"
        );
      }
    };
    hydrateFromServer();
  }, [isLoggedIn, userId, dispatch]);

  const addItemToCart = useCallback(
    async (product: ProductBase, quantity: number = 1): Promise<void> => {
      if (!product) return;
      try {
        const sanitizedProduct = prepareProduct(product);
        localMutationAtRef.current = Date.now();
        dispatch(addToCart({ product: sanitizedProduct, quantity }));
        if (isLoggedIn && sanitizedProduct?.code && userId) {
          await cartService.addToCart(userId, sanitizedProduct.code, quantity);
        }
      } catch {
        throw new Error("Възникна грешка при добавяне на продукт в количката!");
      }
    },
    [dispatch, isLoggedIn, userId]
  );

  const updateCartItemQuantity = useCallback(
    async (productCode: string, quantity: number) => {
      localMutationAtRef.current = Date.now();
      dispatch(updateCartItem({ productCode, quantity }));
      if (isLoggedIn && userId) {
        cartService.updateCartItem(userId, productCode, quantity).catch(() => {
          throw new Error("Възникна грешка при обновяване на количката!");
        });
      }
    },
    [dispatch, isLoggedIn, userId]
  );

  const removeItemFromCart = useCallback(
    async (productCode: string) => {
      localMutationAtRef.current = Date.now();
      dispatch(removeFromCart(productCode));
      if (isLoggedIn && userId) {
        cartService.removeFromCart(userId, productCode).catch(() => {
          throw new Error(
            "Възникна грешка при премахване на продукт от количката!"
          );
        });
      }
    },
    [dispatch, isLoggedIn, userId]
  );

  const clearUserCart = useCallback(() => {
    localMutationAtRef.current = Date.now();
    if (isLoggedIn && userId) {
      dispatch(clearCart(userId));
    } else {
      dispatch(clearCart(""));
    }
  }, [dispatch, isLoggedIn, userId]);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  }, [items]);

  const getCartItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return {
    items,
    loading,
    error,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearUserCart,
    getCartTotal,
    getCartItemCount,
  };
};
