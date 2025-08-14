import axios from "axios";
import { Category as CategoryPrisma } from "@prisma/client";
import { Category } from "@/lib/interfaces";
import { handleError } from "@/lib/handleError";

export const fetchCategories = async (): Promise<CategoryPrisma[]> => {
  try {
    const { data } = await axios.get("/api/dashboard/categories");
    return data.sort((a: { code: string }, b: { code: string }) =>
      a.code.localeCompare(b.code)
    );
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const fetchCategoriesForHeader = async () => {
  try {
    const { data } = await axios.get("/api/public/categories");
    return data.map((category: { name: string }) => category.name);
  } catch (error) {
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
    throw new Error(handleError(error));
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await axios.delete(`/api/dashboard/categories/${id}`);
    return id;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const fetchCategory = async (id: string) => {
  try {
    const { data } = await axios.get(`/api/dashboard/categories/${id}`);
    return data;
  } catch (error) {
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
    throw new Error(handleError(error));
  }
};
