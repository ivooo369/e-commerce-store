import axios from "axios";
import { ProductBase } from "@/lib/interfaces";
import { sanitizeProduct } from "@/lib/sanitizeProduct";
import { handleError } from "@/lib/handleError";

interface CartItem {
  product: ProductBase;
  quantity: number;
}

export const cartService = {
  async getCartItems(customerId: string): Promise<CartItem[]> {
    try {
      const { data } = await axios.get("/api/cart", {
        params: { customerId },
        headers: { "Cache-Control": "no-cache" },
      });

      interface CartItemResponse {
        product: {
          id: string;
          name: string;
          code: string;
          price: number;
          description?: string;
          images?: string[];
          createdAt?: string;
          updatedAt?: string;
        };
        quantity: number;
      }

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
      console.error(
        "Възникна грешка при зареждане на продуктите в количката:",
        error
      );
      throw new Error(handleError(error));
    }
  },

  async addToCart(
    customerId: string,
    productCode: string,
    quantity: number
  ): Promise<void> {
    try {
      await axios.post("/api/cart", {
        customerId,
        productCode,
        quantity,
      });
    } catch (error) {
      console.error(
        "Възникна грешка при добавяне на продукт в количката:",
        error
      );
      throw new Error(handleError(error));
    }
  },

  async updateCartItem(
    customerId: string,
    productCode: string,
    quantity: number
  ): Promise<void> {
    try {
      await axios.put("/api/cart", {
        customerId,
        productIdentifier: productCode,
        quantity,
      });
    } catch (error) {
      console.error(
        "Възникна грешка при обновяване на продукт в количката:",
        error
      );
      throw new Error(handleError(error));
    }
  },

  async removeFromCart(customerId: string, productCode: string): Promise<void> {
    try {
      await axios.delete("/api/cart", {
        data: {
          customerId,
          productIdentifier: productCode,
        },
      });
    } catch (error) {
      console.error(
        "Възникна грешка при премахване на продукт от количката:",
        error
      );
      throw new Error(handleError(error));
    }
  },

  async clearCart(customerId: string): Promise<void> {
    try {
      await axios.delete("/api/cart", {
        data: {
          customerId,
          clearAll: true,
        },
      });
    } catch (error) {
      console.error("Възникна грешка при изчистване на количката:", error);
      throw new Error(handleError(error));
    }
  },
};
