import axios from "axios";
import { handleError } from "@/lib/handleError";
import {
  OrderData,
  OrderResponse,
  OrderStatusResponse,
  PaginatedOrdersResponse,
} from "@/lib/interfaces";

const orderService = {
  async createOrder(orderData: OrderData): Promise<{ orderId: string }> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.post(
        `${baseUrl}/api/public/orders`,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("Възникна грешка при създаване на поръчката:", error);
      throw new Error(handleError(error));
    }
  },

  async getOrder(orderId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.get(
        `${baseUrl}/api/public/orders/${orderId}`
      );
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
      const response = await axios.post(`${baseUrl}/api/public/orders/cancel`, {
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
      const response = await axios.post(
        `${baseUrl}/api/public/orders/confirm`,
        {
          orderId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Възникна грешка при потвърждаване на поръчката:", error);
      throw new Error(handleError(error));
    }
  },

  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.get(
        `${baseUrl}/api/public/orders/${orderId}`
      );
      const order = response.data;

      const createdAt = order.createdAt
        ? new Date(order.createdAt)
        : new Date();

      return {
        status: order.status,
        createdAt,
        name: order.name,
        email: order.email,
      };
    } catch (error) {
      console.error(
        "Възникна грешка при извличане на статуса на поръчката:",
        error
      );
      throw new Error(handleError(error));
    }
  },

  async getUserOrders(token: string): Promise<OrderResponse[]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.get(`${baseUrl}/api/public/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Възникна грешка при зареждане на поръчките:", error);
      throw new Error(handleError(error));
    }
  },

  async updateOrder(orderId: string, updateData: { isCompleted?: boolean }) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.patch(
        `${baseUrl}/api/dashboard/orders/${orderId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Възникна грешка при актуализиране на поръчката:", error);
      throw new Error(handleError(error));
    }
  },

  async getOrderById(orderId: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.get(
        `${baseUrl}/api/public/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error("Възникна грешка при извличане на поръчката:", error);
      throw new Error(handleError(error));
    }
  },

  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    search?: string,
    status?: string
  ): Promise<PaginatedOrdersResponse> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await axios.get(
        `${baseUrl}/api/dashboard/orders?${params.toString()}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Възникна грешка при извличане на поръчките:", error);
      throw new Error(handleError(error));
    }
  },
};

export { orderService };
