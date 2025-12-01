import axios from "axios";
import type { Product as PrismaSchema, Subcategory } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import type {
  Product,
  ProductWithNestedSubcategories,
} from "@/lib/types/interfaces";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const fetchAllPublicProducts = async (): Promise<
  ProductWithNestedSubcategories[]
> => {
  try {
    const response = await axios.get(`${baseUrl}/api/public/products`);
    const data: ProductWithNestedSubcategories[] = response.data;
    return data.sort((a, b) => a.code.localeCompare(b.code));
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на продуктите!");
  }
};

export const fetchProducts = async (): Promise<
  ProductWithNestedSubcategories[]
> => {
  try {
    const response = await axios.get("/api/dashboard/products");
    const data: ProductWithNestedSubcategories[] = response.data;
    data.sort((a, b) => a.code.localeCompare(b.code));
    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на продуктите!");
  }
};

export const fetchProductByCode = async (
  code: string,
  isServer: boolean = false
): Promise<PrismaSchema> => {
  try {
    const url = isServer
      ? `${baseUrl}/api/public/products/${code}`
      : `/api/public/products/${code}`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на продукта!");
  }
};

export const fetchProductsByQuery = async (
  query: string
): Promise<PrismaSchema[]> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const url = `${baseUrl}/api/public/products/search?query=${encodeURIComponent(
      query
    )}`;
    const response = await axios.get(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на продуктите!");
  }
};

export const fetchFilteredProducts = async (
  categoryId: string,
  selectedSubcategories: string[],
  subcategories: Subcategory[]
) => {
  try {
    const subcategoryIds = selectedSubcategories
      .map((subcategoryCode) => {
        const subcategory = subcategories.find(
          (subcategory) =>
            `${subcategory.code} - ${subcategory.name}` === subcategoryCode
        );
        return subcategory?.id;
      })
      .filter(Boolean);

    const url = subcategoryIds.length
      ? `/api/public/products?subcategories=${subcategoryIds.join(
          ","
        )}&categoryId=${categoryId}`
      : `/api/public/products?categoryId=${categoryId}`;

    const response = await axios.get(url);

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error("Възникна грешка! Не е получен масив от продукти!");
    }
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на продуктите!");
  }
};

export const fetchRecommendations = async (searchTerm: string) => {
  try {
    const response = await axios.get(
      `/api/public/products/search?query=${searchTerm}`
    );
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error("Възникна грешка при извличане на продуктите!");
    }
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на продуктите!");
  }
};

export const createProduct = async (productData: Product) => {
  try {
    const response = await axios.post("/api/dashboard/products", productData);
    const countResponse = await axios.get("/api/dashboard/products?count=true");
    return {
      ...response.data,
      newCount: countResponse.data.count,
    };
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
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const response = await axios.delete(`/api/dashboard/products/${id}`);
    const countResponse = await axios.get("/api/dashboard/products?count=true");
    return {
      ...response.data,
      newCount: countResponse.data.count,
    };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при изтриване на продукта!");
  }
};

export const fetchProduct = async (id: string) => {
  try {
    const response = await axios.get(`/api/dashboard/products/${id}`);
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на продукта!");
  }
};

export const editProduct = async (id: string, updatedProduct: PrismaSchema) => {
  try {
    const response = await axios.put(
      `/api/dashboard/products/${id}`,
      updatedProduct
    );
    return response.data;
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
    throw new Error("Възникна грешка при редактиране на продукта!");
  }
};

export const getProductCount = async (): Promise<number> => {
  try {
    const response = await axios.get("/api/dashboard/products?count=true");
    return response.data.count;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на броя на продуктите!");
  }
};


