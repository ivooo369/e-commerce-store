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

export async function POST(req: Request) {
  try {
    const { name, code, imageUrl } = await req.json();

    const newCategory = await prisma.category.create({
      data: {
        name,
        code,
        imageUrl: "",
      },
    });

    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: "LIPCI/categories",
    });

    await prisma.category.update({
      where: { id: newCategory.id },
      data: {
        imageUrl: uploadResponse.secure_url,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
