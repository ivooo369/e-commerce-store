import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "@/app/lib/cloudinary.config";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Възникна грешка при извличане на категориите:", error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на категориите!" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, imageUrl } = body;

    if (!name || !code) {
      return NextResponse.json(
        { message: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Трябва да качите изображение на категорията!" },
        { status: 400 }
      );
    }

    const existingCategoryName = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategoryName) {
      return NextResponse.json(
        { message: "Категория с това име вече съществува!" },
        { status: 400 }
      );
    }

    const existingCategoryCode = await prisma.category.findUnique({
      where: { code },
    });

    if (existingCategoryCode) {
      return NextResponse.json(
        { message: "Категория с този код вече съществува!" },
        { status: 400 }
      );
    }

    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: "LIPCI/categories",
    });

    const newCategory = await prisma.category.create({
      data: {
        name,
        code,
        imageUrl: uploadResponse.secure_url,
      },
    });

    return NextResponse.json(
      { message: "Категорията е добавена успешно!", category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Възникна грешка при добавяне на категорията:", error);
    return NextResponse.json(
      { message: "Възникна грешка при добавяне на категорията!" },
      { status: 500 }
    );
  }
}
