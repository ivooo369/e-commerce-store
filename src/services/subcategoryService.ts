import axios from "axios";
import { Subcategory as SubcategoryPrisma } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import type { Subcategory } from "@/lib/types/interfaces";

export const createSubcategory = async (subcategoryData: Subcategory) => {
  try {
    const response = await axios.post(
      "/api/dashboard/subcategories",
      subcategoryData
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
    throw new Error("Възникна грешка при добавяне на подкатегорията!");
  }
};

export const fetchSubcategories = async (): Promise<SubcategoryPrisma[]> => {
  try {
    const response = await axios.get("/api/dashboard/subcategories");
    const data: SubcategoryPrisma[] = response.data;
    data.sort((a, b) => a.code.localeCompare(b.code));
    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на подкатегориите!");
  }
};

export const fetchSubcategory = async (id: string) => {
  try {
    const response = await axios.get(`/api/dashboard/subcategories/${id}`);
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на подкатегорията!");
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
    throw new Error("Възникна грешка при редактиране на подкатегорията!");
  }
};

export const deleteSubcategory = async (id: string): Promise<string> => {
  try {
    await axios.delete(`/api/dashboard/subcategories/${id}`);
    return id;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при изтриване на подкатегорията!");
  }
};
