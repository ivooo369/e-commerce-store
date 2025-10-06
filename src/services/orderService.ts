import axios from "axios";
import {
  OrderData,
  OrderResponse,
  OrderStatusResponse,
  PaginatedOrdersResponse,
} from "@/lib/types/interfaces";
import * as Sentry from "@sentry/nextjs";

export const orderService = {
  async createOrder(orderData: OrderData): Promise<{ orderId: string }> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.post(
        `${baseUrl}/api/public/orders`,
        orderData
      );
      return response.data;
    } catch (error) {
      Sentry.captureException(error);
      throw new Error("Възникна грешка при създаване на поръчката!");
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
      Sentry.captureException(error);
      throw new Error("Възникна грешка при извличане на данните за поръчката!");
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
      Sentry.captureException(error);
      throw new Error("Възникна грешка при отказване на поръчката!");
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
      Sentry.captureException(error);
      throw new Error("Възникна грешка при потвърждаване на поръчката!");
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
      Sentry.captureException(error);
      throw new Error("Възникна грешка при извличане на статуса на поръчката!");
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
      Sentry.captureException(error);
      throw new Error("Възникна грешка при зареждане на поръчките!");
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
      Sentry.captureException(error);
      throw new Error("Възникна грешка при актуализиране на поръчката!");
    }
  },

  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const response = await axios.get(
        `${baseUrl}/api/public/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      Sentry.captureException(error);
      throw new Error("Възникна грешка при извличане на поръчката!");
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
      Sentry.captureException(error);
      throw new Error("Възникна грешка при извличане на поръчките!");
    }
  },
};
