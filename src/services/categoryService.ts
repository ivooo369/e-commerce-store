import axios from "axios";
import * as Sentry from "@sentry/nextjs";
import type { Category } from "@/lib/types/interfaces";
import type { Category as CategoryPrisma } from "@/generated/client/client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const fetchCategories = async (): Promise<CategoryPrisma[]> => {
  try {
    const url =
      typeof window === "undefined"
        ? `${baseUrl}/api/public/categories`
        : "/api/public/categories";

    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при зареждане на категориите!");
  }
};

export const fetchDashboardCategories = async (): Promise<CategoryPrisma[]> => {
  try {
    const { data } = await axios.get("/api/dashboard/categories");
    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при зареждане на категориите!");
  }
};

export const fetchCategoriesForHeader = async () => {
  try {
    const { data } = await axios.get("/api/public/categories");
    return data.map((category: { name: string }) => category.name);
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на категориите!");
  }
};

export const createCategory = async (categoryData: Category) => {
  try {
    const { data } = await axios.post(
      "/api/dashboard/categories",
      categoryData
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    const axiosError = error as {
      response?: {
        data?: { message?: string; error?: string };
      };
    };

    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    } else if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error);
    }
    throw new Error("Възникна грешка при създаване на категорията!");
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await axios.delete(`/api/dashboard/categories/${id}`);
    return id;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при изтриване на категорията!");
  }
};

export const fetchCategory = async (id: string) => {
  try {
    const { data } = await axios.get(`/api/dashboard/categories/${id}`);
    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на категорията!");
  }
};

export const editCategory = async (updatedCategory: Category, id: string) => {
  try {
    const { data } = await axios.put(
      `/api/dashboard/categories/${id}`,
      updatedCategory
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    const axiosError = error as {
      response?: {
        data?: { message?: string; error?: string };
      };
    };

    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    } else if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error);
    }
    throw new Error("Възникна грешка при обновяване на категорията!");
  }
};

export const fetchCategoryByNameWithProducts = async (name: string) => {
  try {
    const decodedName = decodeURIComponent(name);
    const encodedName = encodeURIComponent(decodedName);

    const { data } = await axios.get(
      `/api/public/categories/name/${encodedName}`
    );

    return {
      category: data.category,
      subcategories: data.subcategories || [],
      products: data.products || [],
    };
  } catch (error) {
    Sentry.captureException(error);
    const axiosError = error as {
      response?: {
        data?: { message?: string };
        status?: number;
      };
    };

    if (
      axiosError.response?.status === 404 &&
      axiosError.response?.data?.message === "Категорията не е намерена!"
    ) {
      throw new Error("Категорията не е намерена!");
    }

    throw new Error("Възникна грешка при зареждане на категорията с продукти!");
  }
};
