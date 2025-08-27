import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  setCartItems,
} from "@/lib/cartSlice";
import { useCallback, useEffect, useRef } from "react";
import { ProductBase } from "@/lib/interfaces";
import { sanitizeProduct } from "@/lib/sanitizeProduct";
import { cartService } from "@/services/cartService";

const prepareProduct = (product: ProductBase): ProductBase => {
  if (!product) return product;
  try {
    const productCopy = JSON.parse(JSON.stringify(product));
    return sanitizeProduct(productCopy);
  } catch (error) {
    console.error("Възникна грешка при обработка на продукта:", error);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
  }, []);

  useEffect(() => {
    const hydrateFromServer = async () => {
      if (!isLoggedIn || !userId) return;
      const hydrateStart = Date.now();
      try {
        const serverItems = await cartService.getCartItems(userId);
        if (localMutationAtRef.current > hydrateStart) return;
        dispatch(setCartItems(serverItems));
      } catch (e) {
        console.error(
          "Възникна грешка при зареждане на количката от сървъра:",
          e
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
      } catch (error) {
        console.error(
          "Възникна грешка при добавяне на продукт в количката:",
          error
        );
      }
    },
    [dispatch, isLoggedIn, userId]
  );

  const updateCartItemQuantity = useCallback(
    async (productCode: string, quantity: number) => {
      localMutationAtRef.current = Date.now();
      dispatch(updateCartItem({ productCode, quantity }));
      if (isLoggedIn && userId) {
        cartService
          .updateCartItem(userId, productCode, quantity)
          .catch((err) =>
            console.error("Възникна грешка при обновяване на количката:", err)
          );
      }
    },
    [dispatch, isLoggedIn, userId]
  );

  const removeItemFromCart = useCallback(
    async (productCode: string) => {
      localMutationAtRef.current = Date.now();
      dispatch(removeFromCart(productCode));
      if (isLoggedIn && userId) {
        cartService
          .removeFromCart(userId, productCode)
          .catch((err) =>
            console.error(
              "Възникна грешка при премахване на продукт от количката:",
              err
            )
          );
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
