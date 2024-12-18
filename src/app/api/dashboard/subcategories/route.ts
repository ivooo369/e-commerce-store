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
    console.error("Възникна грешка при извличане на подкатегорията:", error);

    return NextResponse.json(
      { error: "Възникна грешка при извличане на подкатегорията!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, categoryId } = body;

    if (!name || !code || !categoryId) {
      return NextResponse.json(
        { error: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    const existingSubcategoryName = await prisma.subcategory.findUnique({
      where: { name },
    });

    if (existingSubcategoryName) {
      return NextResponse.json(
        {
          error: "Подкатегория с това име вече съществува!",
        },
        { status: 400 }
      );
    }

    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { code },
    });

    if (existingSubcategory) {
      return NextResponse.json(
        {
          error: "Подкатегория с този код вече съществува!",
        },
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

    return NextResponse.json(
      {
        message: "Подкатегорията е добавена успешно!",
        subcategory: newSubcategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Грешка при добавяне на подкатегория:", error);
    return NextResponse.json(
      { error: "Възникна грешка! Моля, опитайте отново!" },
      { status: 500 }
    );
  }
}
