import { CartItem } from "../types/interfaces";
import { sanitizeProduct } from "../utils/sanitizeProduct";

const ensureDateString = (value: Date): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return value;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  return undefined;
};

export const getStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("cart");
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      ...item,
      product: {
        ...item.product,
        createdAt:
          ensureDateString(item.product?.createdAt) || new Date().toISOString(),
        updatedAt:
          ensureDateString(item.product?.updatedAt) || new Date().toISOString(),
      },
    }));
  } catch {
    return [];
  }
};

export const setStoredCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;

  try {
    const serializableItems = items.map((item) => ({
      ...item,
      product: sanitizeProduct(item.product),
    }));

    localStorage.setItem("cart", JSON.stringify(serializableItems));
  } catch {
    throw new Error(
      "Възникна грешка при записване на информацията в localStorage!"
    );
  }
};

export const clearStoredCart = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("cart");
  } catch {
    throw new Error(
      "Възникна грешка при изчистване на информацията от localStorage!"
    );
  }
};
