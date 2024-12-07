import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "@/app/lib/cloudinary.config";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, imageUrl } = body;

    // Проверка за задължителни полета без изображението
    if (!name || !code) {
      return NextResponse.json(
        { error: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    // Отделна проверка за изображението
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Трябва да качите изображение на категорията!" },
        { status: 400 }
      );
    }

    // Проверка дали съществува категория с това име
    const existingCategoryName = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategoryName) {
      return NextResponse.json(
        {
          error: "Категория с това име вече съществува!",
        },
        { status: 400 }
      );
    }

    // Проверка дали съществува категория с този код
    const existingCategory = await prisma.category.findUnique({
      where: { code },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          error: "Категория с този код вече съществува!",
        },
        { status: 400 }
      );
    }

    // Качване на изображението
    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: "LIPCI/categories",
    });

    // Създаване на нова категория
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
    console.error("Грешка при добавяне на категория:", error);
    return NextResponse.json(
      { error: "Възникна грешка! Моля, опитайте отново!" },
      { status: 500 }
    );
  }
}
