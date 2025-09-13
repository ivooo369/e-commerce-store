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
          select: {
            subcategoryId: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не е намерен! Възможно е да не е в наличност." },
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
      { message: "Възникна грешка при извличане на продукта!" },
      { status: 500 }
    );
  }
}
