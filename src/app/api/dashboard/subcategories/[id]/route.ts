import prisma from "@/lib/services/prisma";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
    });

    if (!subcategory) {
      return NextResponse.json(
        { message: "Подкатегорията не е намерена!" },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на подкатегорията!" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();
    const { categoryId } = body;
    const name = body.name?.trim();
    const code = body.code?.trim();

    if (!name || !code || !categoryId) {
      return NextResponse.json(
        { message: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      return NextResponse.json(
        { message: "Подкатегорията не е намерена!" },
        { status: 404 }
      );
    }

    const existingSubcategoryName = await prisma.subcategory.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (existingSubcategoryName) {
      return NextResponse.json(
        { message: "Подкатегория с това име вече съществува!" },
        { status: 400 }
      );
    }

    const existingSubcategoryCode = await prisma.subcategory.findFirst({
      where: {
        code,
        NOT: { id },
      },
    });

    if (existingSubcategoryCode) {
      return NextResponse.json(
        { message: "Подкатегория с този код вече съществува!" },
        { status: 400 }
      );
    }

    const updatedSubcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name,
        code,
        categoryId,
      },
    });

    return NextResponse.json(
      {
        message: "Подкатегорията е обновена успешно!",
        subcategory: updatedSubcategory,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при редактиране на подкатегория!" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        { message: "Подкатегорията не е намерена!" },
        { status: 404 }
      );
    }

    const otherSubcategory = await prisma.subcategory.findUnique({
      where: { name: "Други" },
    });

    if (!otherSubcategory) {
      return NextResponse.json(
        { message: "Подкатегорията 'Други' не е намерена!" },
        { status: 404 }
      );
    }

    for (const product of subcategory.products) {
      const otherSubcategoryLinks = await prisma.productSubcategory.count({
        where: {
          productId: product.productId,
          NOT: { subcategoryId: subcategory.id },
        },
      });

      if (otherSubcategoryLinks === 0) {
        await prisma.productSubcategory.updateMany({
          where: {
            productId: product.productId,
            subcategoryId: subcategory.id,
          },
          data: { subcategoryId: otherSubcategory.id },
        });
      }
    }

    await prisma.productSubcategory.deleteMany({
      where: { subcategoryId: subcategory.id },
    });

    await prisma.subcategory.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Подкатегорията е изтрита успешно!" },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при изтриване на подкатегорията!" },
      { status: 500 }
    );
  }
}
