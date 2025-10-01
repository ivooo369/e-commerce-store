import axios from "axios";
import { Category as CategoryPrisma } from "@prisma/client";
import { Category } from "@/lib/types/interfaces";
import prisma from "@/lib/services/prisma";

export const fetchCategories = async (): Promise<CategoryPrisma[]> => {
  if (typeof window === "undefined") {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { code: "asc" },
      });
      return categories;
    } catch {
      throw new Error("Възникна грешка при зареждане на категориите!");
    }
  }

  try {
    const { data } = await axios.get("/api/public/categories");
    return data;
  } catch {
    throw new Error("Възникна грешка при зареждане на категориите!");
  }
};

export const fetchDashboardCategories = async (): Promise<CategoryPrisma[]> => {
  try {
    const { data } = await axios.get("/api/dashboard/categories");
    return data;
  } catch {
    throw new Error("Възникна грешка при зареждане на категориите!");
  }
};

export const fetchCategoriesForHeader = async () => {
  try {
    const { data } = await axios.get("/api/public/categories");
    return data.map((category: { name: string }) => category.name);
  } catch {
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
  } catch (error: unknown) {
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
  } catch {
    throw new Error("Възникна грешка при изтриване на категорията!");
  }
};

export const fetchCategory = async (id: string) => {
  try {
    const { data } = await axios.get(`/api/dashboard/categories/${id}`);
    return data;
  } catch {
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
  } catch (error: unknown) {
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
  if (typeof window === "undefined") {
    try {
      const decodedName = decodeURIComponent(name);

      const category = await prisma.category.findFirst({
        where: { name: decodedName },
      });

      if (!category) {
        throw new Error("Категорията не е намерена!");
      }

      const subcategories = await prisma.subcategory.findMany({
        where: { categoryId: category.id },
        include: {
          products: {
            include: {
              product: {
                include: {
                  subcategories: {
                    include: {
                      subcategory: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const products = subcategories.flatMap((sc) =>
        sc.products.map((p) => p.product)
      );

      return {
        category,
        subcategories: subcategories.map((sc) => ({
          id: sc.id,
          name: sc.name,
          code: sc.code,
          categoryId: sc.categoryId,
          createdAt: sc.createdAt,
          updatedAt: sc.updatedAt,
          category: {
            id: category.id,
            name: category.name,
            code: category.code,
          },
        })),
        products,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Категорията не е намерена!"
      ) {
        throw error;
      }

      throw new Error(
        "Възникна грешка при зареждане на категорията с продукти!"
      );
    }
  }

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
  } catch (error: unknown) {
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
