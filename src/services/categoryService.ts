import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { Category as CategoryPrisma } from "@prisma/client";
import { Category } from "@/lib/interfaces";
import { handleError } from "@/lib/handleError";

const prisma = new PrismaClient();

export const fetchCategories = async (): Promise<CategoryPrisma[]> => {
  if (typeof window === "undefined") {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { code: "asc" },
      });
      return categories;
    } catch (error) {
      console.error("Възникна грешка при зареждане на категориите:", error);
      throw new Error(handleError(error));
    }
  }

  try {
    const { data } = await axios.get("/api/public/categories");
    return data.sort((a: { code: string }, b: { code: string }) =>
      a.code.localeCompare(b.code)
    );
  } catch (error) {
    console.error("Възникна грешка при зареждане на категориите:", error);
    throw new Error(handleError(error));
  }
};

export const fetchCategoriesForHeader = async () => {
  try {
    const { data } = await axios.get("/api/public/categories");
    return data.map((category: { name: string }) => category.name);
  } catch (error) {
    console.error("Възникна грешка при извличане на категориите:", error);
    throw new Error(handleError(error));
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
    console.error("Възникна грешка при създаване на категория:", error);
    throw new Error(handleError(error));
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await axios.delete(`/api/dashboard/categories/${id}`);
    return id;
  } catch (error) {
    console.error("Възникна грешка при изтриване на категория:", error);
    throw new Error(handleError(error));
  }
};

export const fetchCategory = async (id: string) => {
  try {
    const { data } = await axios.get(`/api/dashboard/categories/${id}`);
    return data;
  } catch (error) {
    console.error("Възникна грешка при извличане на категория:", error);
    throw new Error(handleError(error));
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
    console.error("Възникна грешка при обновяване на категория:", error);
    throw new Error(handleError(error));
  }
};

export const fetchCategoryByNameWithProducts = async (name: string) => {
  if (typeof window === "undefined") {
    try {
      const decodedName = decodeURIComponent(name);
      const category = await prisma.category.findFirst({
        where: { name: decodedName },
        include: {
          subcategories: {
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
          },
        },
      });
      return category;
    } catch (error) {
      console.error(
        "Възникна грешка при зареждане на категорията с продукти:",
        error
      );
      throw new Error(handleError(error));
    }
  }

  try {
    const decodedName = decodeURIComponent(name);
    const encodedName = encodeURIComponent(decodedName);
    const { data } = await axios.get(
      `/api/public/categories/name/${encodedName}`
    );
    return data;
  } catch (error) {
    console.error(
      "Възникна грешка при зареждане на категорията с продукти:",
      error
    );
    throw new Error(handleError(error));
  }
};
