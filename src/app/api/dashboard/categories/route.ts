import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import cloudinary from "@/lib/config/cloudinary.config";

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при извличане на категориите!" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    const name = body.name?.trim();
    const code = body.code?.trim();

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

    const base64Content = imageUrl.split(",")[1] || imageUrl;
    const sizeInBytes = (base64Content.length * 3) / 4;

    if (sizeInBytes > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Изображението надвишава максималния размер от 2 MB!" },
        { status: 400 }
      );
    }

    const existingCategoryName = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategoryName) {
      return NextResponse.json(
        { message: "Категория с това име вече съществува!" },
        { status: 400 }
      );
    }

    const existingCategoryCode = await prisma.category.findFirst({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },
      },
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
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при добавяне на категорията!" },
      { status: 500 }
    );
  }
}
