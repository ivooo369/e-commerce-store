import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("query") || "";

  try {
    if (!searchTerm) {
      return NextResponse.json(
        { message: "Не е въведен текст за търсене." },
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
    console.error("Възникна грешка при извличане на продуктите:", error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на продуктите!" },
      { status: 500 }
    );
  }
}
