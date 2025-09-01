import axios from "axios";
import { handleError } from "@/lib/handleError";

const API_BASE_URL =
  typeof window !== "undefined" ? "" : "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getFavorites = async (customerId: string) => {
  if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
    return [];
  }

  try {
    const response = await api.get(`/api/public/favorites`, {
      params: { customerId },
    });
    return response.data;
  } catch (error) {
    console.error("Възникна грешка при извличане на любимите продукти:", error);
    throw new Error(handleError(error));
  }
};

export const addFavorite = async (customerId: string, productId: string) => {
  if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
    return { success: true, message: "Build time mock" };
  }

  try {
    const response = await api.post(`/api/public/favorites`, {
      customerId,
      productId,
    });
    return response.data;
  } catch (error) {
    console.error("Възникна грешка при добавяне в 'Любими':", error);
    throw new Error(handleError(error));
  }
};

export const removeFavorite = async (customerId: string, productId: string) => {
  if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
    return { success: true, message: "Build time mock" };
  }

  try {
    const response = await api.delete(`/api/public/favorites`, {
      data: { customerId, productId },
    });
    return response.data;
  } catch (error) {
    console.error("Възникна грешка при премахване от 'Любими':", error);
    throw new Error(handleError(error));
  }
};
