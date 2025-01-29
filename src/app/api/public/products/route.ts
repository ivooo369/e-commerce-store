import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subcategories = searchParams.get("subcategories");
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json(
      { message: "Не е избрана категория." },
      { status: 400 }
    );
  }

  try {
    let products;

    if (!subcategories) {
      products = await prisma.product.findMany({
        where: {
          subcategories: {
            some: {
              subcategory: {
                category: {
                  id: categoryId,
                },
              },
            },
          },
        },
      });
    } else {
      const subcategoryIds = subcategories.split(",").map((id) => id.trim());
      products = await prisma.product.findMany({
        where: {
          subcategories: {
            some: {
              subcategoryId: {
                in: subcategoryIds,
              },
              subcategory: {
                category: {
                  id: categoryId,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Възникна грешка при извличане на продуктите:", error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на продуктите!" },
      { status: 500 }
    );
  }
}
