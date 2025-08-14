import axios from "axios";
import { Subcategory } from "@/lib/interfaces";
import { Subcategory as SubcategoryPrisma } from "@prisma/client";
import { handleError } from "@/lib/handleError";

export const createSubcategory = async (subcategoryData: Subcategory) => {
  try {
    const response = await axios.post(
      "/api/dashboard/subcategories",
      subcategoryData
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const fetchSubcategories = async (): Promise<SubcategoryPrisma[]> => {
  try {
    const response = await axios.get("/api/dashboard/subcategories");
    const data: SubcategoryPrisma[] = response.data;
    data.sort((a, b) => a.code.localeCompare(b.code));
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const fetchSubcategory = async (id: string) => {
  try {
    const response = await axios.get(`/api/dashboard/subcategories/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const editSubcategory = async ({
  id,
  updatedSubcategory,
}: {
  id: string;
  updatedSubcategory: { name: string; code: string; categoryId: string };
}) => {
  try {
    const response = await axios.put(
      `/api/dashboard/subcategories/${id}`,
      updatedSubcategory
    );
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const deleteSubcategory = async (id: string): Promise<string> => {
  try {
    await axios.delete(`/api/dashboard/subcategories/${id}`);
    return id;
  } catch (error) {
    throw new Error(handleError(error));
  }
};
