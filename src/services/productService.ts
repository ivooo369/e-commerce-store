import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { Product, ProductWithSubcategories } from "@/lib/interfaces";
import { Product as PrismaSchema, Subcategory } from "@prisma/client";
import { handleError } from "@/lib/handleError";

const prisma = new PrismaClient();
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const fetchAllPublicProducts = async (): Promise<
  ProductWithSubcategories[]
> => {
  if (typeof window === "undefined") {
    try {
      const products = await prisma.product.findMany({
        include: {
          subcategories: {
            include: {
              subcategory: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { code: "asc" },
      });
      return products as unknown as ProductWithSubcategories[];
    } catch (error) {
      console.error("Възникна грешка при извличане на продуктите:", error);
      throw new Error(handleError(error));
    }
  }

  try {
    const response = await axios.get(`${baseUrl}/api/public/products`);
    const data: ProductWithSubcategories[] = response.data;
    return data.sort((a, b) => a.code.localeCompare(b.code));
  } catch (error) {
    console.error("Възникна грешка при извличане на продуктите:", error);
    throw new Error(handleError(error));
  }
};

export const fetchProducts = async (): Promise<ProductWithSubcategories[]> => {
  try {
    const response = await axios.get("/api/dashboard/products");
    const data: ProductWithSubcategories[] = response.data;
    data.sort((a, b) => a.code.localeCompare(b.code));
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const fetchProductByCode = async (
  code: string
): Promise<PrismaSchema> => {
  try {
    const response = await axios.get(`/api/public/products/${code}`);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const fetchProductsByQuery = async (
  query: string
): Promise<PrismaSchema[]> => {
  try {
    const response = await axios.get(
      `/api/public/products/search?query=${query}`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(handleError(error));
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
    throw new Error(handleError(error));
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
    throw new Error(handleError(error));
  }
};

export const createProduct = async (productData: Product) => {
  try {
    const response = await axios.post("/api/dashboard/products", productData);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await axios.delete(`/api/dashboard/products/${id}`);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const fetchProduct = async (id: string) => {
  try {
    const response = await axios.get(`/api/dashboard/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
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
    throw new Error(handleError(error));
  }
};
