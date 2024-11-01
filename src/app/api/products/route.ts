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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, price, description, images, subcategoryIds } = body;

    if (!name || !code || !price || !images || !subcategoryIds) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const imageUploadPromises = images.map((imageUrl: string) =>
      cloudinary.uploader.upload(imageUrl, {
        folder: "LIPCI/products",
      })
    );

    const uploadedImages = await Promise.all(imageUploadPromises);
    const imageUrls = uploadedImages.map((upload) => upload.secure_url);

    const product = await prisma.product.create({
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (product?.images) {
      const deleteImagePromises = product.images.map((imageUrl) => {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        return cloudinary.uploader.destroy(`LIPCI/products/${publicId}`);
      });
      await Promise.all(deleteImagePromises);
    }

    await prisma.productSubcategory.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
