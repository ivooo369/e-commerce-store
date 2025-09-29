import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";

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
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при извличане на любимите продукти!" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { customerId, productId } = body;

    customerId =
      typeof customerId === "string" ? customerId.trim() : customerId;
    productId = typeof productId === "string" ? productId.trim() : productId;

    if (!customerId || !productId) {
      return NextResponse.json(
        { message: "Липсват задължителни данни!" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не съществува!" },
        { status: 404 }
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
      { message: "Продуктът беше добавен успешно към 'Любими'!" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при добавяне на продукта към 'Любими'!" },
      { status: 500 }
    );
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
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при премахване на продукта от 'Любими'!" },
      { status: 500 }
    );
  }
}
