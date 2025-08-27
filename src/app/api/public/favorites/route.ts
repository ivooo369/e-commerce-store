import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { handleError } from "@/lib/handleError";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json(
      { message: "Не е предоставен ID на потребителя!" },
      { status: 400 }
    );
  }

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
      return NextResponse.json([], { status: 200 });
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

    return NextResponse.json(favoriteProducts, { status: 200 });
  } catch (error) {
    console.error("Възникна грешка при извличане на любимите продукти:", error);
    return NextResponse.json({ message: handleError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, productId } = body;

    if (!customerId || !productId) {
      return NextResponse.json(
        { message: "Липсват задължителни данни!" },
        { status: 400 }
      );
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId: customerId,
          productId: productId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { message: "Продуктът вече е в 'Любими'!" },
        { status: 409 }
      );
    }

    await prisma.favorite.create({
      data: {
        customerId: customerId,
        productId: productId,
      },
    });

    return NextResponse.json(
      { message: "Продуктът беше добавен успешно в 'Любими'!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Възникна грешка при добавяне в 'Любими':", error);
    return NextResponse.json({ message: handleError(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { customerId, productId } = body;

    if (!customerId || !productId) {
      return NextResponse.json(
        { message: "Липсват задължителни данни!" },
        { status: 400 }
      );
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId: customerId,
          productId: productId,
        },
      },
    });

    if (!existingFavorite) {
      return NextResponse.json(
        { message: "Продуктът не е намерен в 'Любими'!" },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: {
        customerId_productId: {
          customerId: customerId,
          productId: productId,
        },
      },
    });

    return NextResponse.json(
      { message: "Продуктът беше премахнат успешно от 'Любими'!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при премахване от 'Любими':", error);
    return NextResponse.json({ message: handleError(error) }, { status: 500 });
  }
}
