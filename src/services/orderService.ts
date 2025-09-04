import axios from "axios";
import { handleError } from "@/lib/handleError";
import { OrderData } from "@/lib/interfaces";

interface OrderStatusResponse {
  status: string;
  orderDate: string;
  name: string;
  email: string;
}

export const orderService = {
  async createOrder(orderData: OrderData): Promise<{ orderId: string }> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.post(`${baseUrl}/api/orders`, orderData);
      return response.data;
    } catch (error) {
      console.error("Възникна грешка при създаване на поръчката:", error);
      throw new Error(handleError(error));
    }
  },

  async getOrder(orderId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.get(`${baseUrl}/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Възникна грешка при извличане на данните за поръчката:",
        error
      );
      throw new Error(handleError(error));
    }
  },

  async cancelOrder(orderId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.post(`${baseUrl}/api/orders/cancel`, {
        orderId,
      });
      return response.data;
    } catch (error) {
      console.error("Възникна грешка при отказване на поръчката:", error);
      throw new Error(handleError(error));
    }
  },

  async confirmOrder(orderId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.post(`${baseUrl}/api/orders/confirm`, {
        orderId,
      });
      return response.data;
    } catch (error) {
      console.error("Възникна грешка при потвърждаване на поръчката:", error);
      throw new Error(handleError(error));
    }
  },

  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.get(`${baseUrl}/api/orders/${orderId}`);
      const order = response.data;
      return {
        status: order.status,
        orderDate: order.created_at,
        name: order.name,
        email: order.email
      };
    } catch (error) {
      console.error(
        "Възникна грешка при извличане на статуса на поръчката:",
        error
      );
      throw new Error(handleError(error));
    }
  },
};
