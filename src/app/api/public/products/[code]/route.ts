import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const { code } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { code },
      include: {
        subcategories: {
          include: {
            subcategory: {
              include: {
                category: true
              }
            }
          }
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не е намерен! Възможно е да не е в наличност." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: product.id,
        name: product.name,
        code: product.code,
        price: product.price,
        description: product.description,
        images: product.images,
        subcategories: product.subcategories.map(sub => ({
          id: sub.subcategoryId,
          subcategory: {
            id: sub.subcategory.id,
            name: sub.subcategory.name,
            code: sub.subcategory.code,
            category: {
              id: sub.subcategory.category.id,
              name: sub.subcategory.category.name,
              code: sub.subcategory.category.code
            }
          }
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при извличане на продукта:", error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на продукта!" },
      { status: 500 }
    );
  }
}
