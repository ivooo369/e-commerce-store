import axios from "axios";
import { CartItem, CartItemResponse } from "@/lib/types/interfaces";
import { sanitizeProduct } from "@/lib/utils/sanitizeProduct";
import * as Sentry from "@sentry/nextjs";

export const cartService = {
  async getCartItems(customerId: string): Promise<CartItem[]> {
    try {
      const { data } = await axios.get("/api/public/carts", {
        params: { customerId },
        headers: { "Cache-Control": "no-cache" },
      });

      return (data || [])
        .map((row: CartItemResponse) => ({
          product: sanitizeProduct({
            id: row.product?.id,
            name: row.product?.name,
            code: row.product?.code,
            price: row.product?.price,
            description: row.product?.description,
            images: row.product?.images || [],
            createdAt: row.product?.createdAt,
            updatedAt: row.product?.updatedAt,
          }),
          quantity: row.quantity ?? 1,
        }))
        .filter((ci: CartItem) => ci.product && ci.product.code);
    } catch (error) {
      Sentry.captureException(error);
      throw new Error(
        "Възникна грешка при зареждане на продуктите в количката!"
      );
    }
  },

  async addToCart(
    customerId: string,
    productCode: string,
    quantity: number
  ): Promise<void> {
    try {
      await axios.post("/api/public/carts", {
        customerId,
        productCode,
        quantity,
      });
    } catch (error) {
      Sentry.captureException(error);
      throw new Error("Възникна грешка при добавяне на продукт в количката!");
    }
  },

  async updateCartItem(
    customerId: string,
    productCode: string,
    quantity: number
  ): Promise<void> {
    try {
      await axios.put("/api/public/carts", {
        customerId,
        productIdentifier: productCode,
        quantity,
      });
    } catch (error) {
      Sentry.captureException(error);
      throw new Error("Възникна грешка при обновяване на продукт в количката!");
    }
  },

  async removeFromCart(customerId: string, productCode: string): Promise<void> {
    try {
      await axios.delete("/api/public/carts", {
        data: {
          customerId,
          productIdentifier: productCode,
        },
      });
    } catch (error) {
      Sentry.captureException(error);
      throw new Error(
        "Възникна грешка при премахване на продукт от количката!"
      );
    }
  },

  async clearCart(customerId: string): Promise<void> {
    try {
      await axios.delete("/api/public/carts", {
        data: {
          customerId,
          clearAll: true,
        },
      });
    } catch (error) {
      Sentry.captureException(error);
      throw new Error("Възникна грешка при изчистване на количката!");
    }
  },
};
