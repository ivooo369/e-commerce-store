import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
          select: {
            subcategoryId: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Продуктът не е намерен!" },
        { status: 404 }
      );
    }

    const subcategoryIds = product.subcategories.map(
      (sub) => sub.subcategoryId
    );

    return NextResponse.json(
      {
        name: product.name,
        code: product.code,
        price: product.price,
        description: product.description,
        images: product.images,
        subcategoryIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при извличане на продукта:", error);
    return NextResponse.json(
      { error: "Възникна грешка при извличане на продукта!" },
      { status: 500 }
    );
  }
}
