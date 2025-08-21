import { PrismaClient } from "@prisma/client";
import { handleError } from "@/lib/handleError";

const prisma = new PrismaClient();

export const getFavorites = async (customerId: string) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: {
        customerId: customerId,
      },
      select: {
        productId: true,
      },
    });

    const productIds = favorites.map((fav) => fav.productId);

    if (productIds.length === 0) {
      return [];
    }

    const favoriteProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        subcategories: {
          include: {
            subcategory: true,
          },
        },
      },
    });

    return favoriteProducts;
  } catch (error) {
    console.error("Възникна грешка при извличане на любимите продукти:", error);
    throw new Error(handleError(error));
  }
};

export const addFavorite = async (customerId: string, productId: string) => {
  try {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId: customerId,
          productId: productId,
        },
      },
    });

    if (existingFavorite) {
      throw new Error("Продуктът вече е в 'Любими'!");
    }

    await prisma.favorite.create({
      data: {
        customerId: customerId,
        productId: productId,
      },
    });

    return { success: true };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const removeFavorite = async (customerId: string, productId: string) => {
  try {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId: customerId,
          productId: productId,
        },
      },
    });

    if (!existingFavorite) {
      throw new Error("Продуктът не е намерен в 'Любими'!");
    }

    await prisma.favorite.delete({
      where: {
        customerId_productId: {
          customerId: customerId,
          productId: productId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    throw new Error(handleError(error));
  }
};
