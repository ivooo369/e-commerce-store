import axios from "axios";

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
  } catch {
    throw new Error("Възникна грешка при извличане на любимите продукти!");
  }
};

export const addFavorite = async (customerId: string, productId: string) => {
  if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
    return { success: true };
  }

  try {
    const response = await api.post(`/api/public/favorites`, {
      customerId,
      productId,
    });
    return response.data;
  } catch {
    throw new Error("Възникна грешка при добавяне на продукта към 'Любими'!");
  }
};

export const removeFavorite = async (customerId: string, productId: string) => {
  if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
    return { success: true, message: "Възникна грешка!" };
  }

  try {
    const response = await api.delete(`/api/public/favorites`, {
      data: { customerId, productId },
    });
    return response.data;
  } catch {
    throw new Error("Възникна грешка при премахване от 'Любими'!");
  }
};
