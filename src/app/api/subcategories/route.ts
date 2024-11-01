import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const subcategories = await prisma.subcategory.findMany({
      include: { category: true },
    });

    return NextResponse.json(subcategories, { status: 200 });
  } catch (error) {
    console.error("Error fetching subcategories:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to fetch subcategories", details: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const {
      name,
      code,
      categoryId,
    }: { name: string; code: string; categoryId: string } = await req.json();

    if (!name || !code || !categoryId) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    const newSubcategory = await prisma.subcategory.create({
      data: {
        name,
        code,
        category: {
          connect: { id: categoryId },
        },
      },
    });

    return NextResponse.json(newSubcategory, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to create subcategory", details: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
