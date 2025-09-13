import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const decodedName = decodeURIComponent(params.name);

    const category = await prisma.category.findUnique({
      where: { name: decodedName },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: category.id },
    });

    const products = await prisma.product.findMany({
      where: {
        subcategories: {
          some: {
            subcategory: {
              categoryId: category.id,
            },
          },
        },
      },
      include: {
        subcategories: {
          include: {
            subcategory: true,
          },
        },
      },
    });

    return NextResponse.json({
      category,
      subcategories,
      products,
    });
  } catch (error) {
    console.error(
      "Възникна грешка при извличане на данните за категорията:",
      error
    );
    return NextResponse.json(
      { message: "Възникна грешка при извличане на данните за категорията!" },
      { status: 500 }
    );
  }
}
