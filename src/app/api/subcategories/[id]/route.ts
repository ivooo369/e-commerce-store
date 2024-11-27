import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory, { status: 200 });
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategory" },
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
    const { name, code, categoryId } = body;

    // Проверка за задължителни полета
    if (!name || !code || !categoryId) {
      return NextResponse.json(
        { error: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    // Проверка дали подкатегорията съществува
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      return NextResponse.json(
        { error: "Подкатегорията не е намерена!" },
        { status: 404 }
      );
    }

    // Проверка дали съществува подкатегория с това име (без текущата)
    const existingSubcategoryName = await prisma.subcategory.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (existingSubcategoryName) {
      return NextResponse.json(
        { error: "Подкатегория с това име вече съществува!" },
        { status: 400 }
      );
    }

    // Проверка дали съществува подкатегория с този код (без текущата)
    const existingSubcategoryCode = await prisma.subcategory.findFirst({
      where: {
        code,
        NOT: { id },
      },
    });

    if (existingSubcategoryCode) {
      return NextResponse.json(
        { error: "Подкатегория с този код вече съществува!" },
        { status: 400 }
      );
    }

    // Актуализиране на подкатегорията
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
        message: "Подкатегорията е актуализирана успешно!",
        subcategory: updatedSubcategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Грешка при редактиране на подкатегория:", error);
    return NextResponse.json(
      { error: "Възникна грешка! Моля, опитайте отново!" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Subcategory ID is required" },
      { status: 400 }
    );
  }

  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const otherSubcategory = await prisma.subcategory.findUnique({
      where: { name: "Други" },
    });

    if (!otherSubcategory) {
      return NextResponse.json(
        { error: "Other subcategory not found" },
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
      { message: "Subcategory deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
