import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary.config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("count") === "true") {
    try {
      const count = await prisma.product.count();
      return NextResponse.json({ count }, { status: 200 });
    } catch (error) {
      console.error(
        "Възникна грешка при извличане на броя на продуктите:",
        error
      );
      return NextResponse.json(
        { error: "Възникна грешка при извличане на броя на продуктите!" },
        { status: 500 }
      );
    }
  }

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
    const { price, images, subcategoryIds } = body;
    let { name, code, description } = body;

    name = name?.trim();
    code = code?.trim();
    description = description?.trim();

    if (!name || !code || !price || !subcategoryIds) {
      return NextResponse.json(
        { error: "Всички полета са задължителни!" },
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
      where: { code: code },
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: "Продукт с този код вече съществува!" },
        { status: 400 }
      );
    }

    const validSubcategories = await prisma.subcategory.findMany({
      where: { id: { in: subcategoryIds } },
      select: { id: true },
    });

    if (validSubcategories.length !== subcategoryIds.length) {
      return NextResponse.json(
        { message: "Една или повече подкатегории не съществуват!" },
        { status: 400 }
      );
    }

    const imageUploadPromises = images.map((imageUrl: string) =>
      cloudinary.uploader.upload(imageUrl, { folder: "LIPCI/products" })
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
    return NextResponse.json(
      { message: "Възникна грешка при добавяне на продукта!" },
      { status: 500 }
    );
  }
}
