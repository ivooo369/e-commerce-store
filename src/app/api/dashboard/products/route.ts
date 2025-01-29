import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "@/app/lib/cloudinary.config";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        subcategories: {
          select: {
            subcategory: true,
          },
        },
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Възникна грешка при извличане на продуктите:", error);
    return NextResponse.json(
      {
        error: "Възникна грешка при извличане на продуктите!",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, price, description, images, subcategoryIds } = body;

    if (!name || !code || !price || !subcategoryIds) {
      return NextResponse.json(
        {
          error: "Всички полета са задължителни!",
        },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "Цената трябва да бъде валидно число и по-голямо от 0!" },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { message: "Трябва да качите поне едно изображение на продукта!" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        code: code,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: "Продукт с този код вече съществува!" },
        { status: 400 }
      );
    }

    const imageUploadPromises = images.map((imageUrl: string) =>
      cloudinary.uploader.upload(imageUrl, {
        folder: "LIPCI/products",
      })
    );

    const uploadedImages = await Promise.all(imageUploadPromises);
    const imageUrls = uploadedImages.map((upload) => upload.secure_url);

    const newProduct = await prisma.product.create({
      data: {
        name,
        code,
        price,
        description,
        images: imageUrls,
        subcategories: {
          create: subcategoryIds.map((subcategoryId: string) => ({
            subcategoryId,
          })),
        },
      },
    });

    return NextResponse.json(
      { message: "Продуктът е добавен успешно!", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Възникна грешка при добавяне на продукта:", error);
  }
}
