import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("query") || "";

  try {
    if (!searchTerm) {
      return NextResponse.json(
        { error: "Не е въведен текст за търсене." },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          {
            subcategories: {
              some: {
                subcategory: {
                  name: { contains: searchTerm, mode: "insensitive" },
                },
              },
            },
          },
        ],
      },
      include: {
        subcategories: {
          include: {
            subcategory: true,
          },
        },
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Грешка при зареждане на продуктите." },
      { status: 500 }
    );
  }
}
