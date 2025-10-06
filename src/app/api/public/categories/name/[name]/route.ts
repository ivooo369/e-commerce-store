import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";

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
        { message: "Категорията не е намерена!" },
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
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на данните за категорията!" },
      { status: 500 }
    );
  }
}
