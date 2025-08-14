import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "@/lib/cloudinary.config";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        subcategories: {
          select: {
            subcategoryId: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не е намерен!" },
        { status: 404 }
      );
    }

    const subcategoryIds = product.subcategories.map(
      (sub) => sub.subcategoryId
    );

    return NextResponse.json(
      {
        name: product.name,
        code: product.code,
        price: product.price,
        description: product.description,
        images: product.images,
        subcategoryIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при извличане на продукта:", error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на продукта!" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();
    const {
      name,
      code,
      price,
      description,
      images,
      subcategoryIds,
      imagesToRemove,
    } = body;

    if (!name || !code || !price || !subcategoryIds) {
      return NextResponse.json(
        { message: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { message: "Цената трябва да бъде валидно число и по-голямо от 0!" },
        { status: 400 }
      );
    }

    if (images && (!Array.isArray(images) || images.length === 0)) {
      return NextResponse.json(
        { message: "Трябва да качите поне едно изображение на продукта!" },
        { status: 400 }
      );
    }

    const existingProductWithCode = await prisma.product.findUnique({
      where: { code },
    });

    if (existingProductWithCode && existingProductWithCode.id !== id) {
      return NextResponse.json(
        { message: "Продукт с този код вече съществува!" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Продуктът не е намерен!" },
        { status: 404 }
      );
    }

    const handleImageUpload = async (images: string[]) => {
      const existingImageUrls = existingProduct.images || [];
      const newImagesToUpload = images.filter(
        (img) => !existingImageUrls.includes(img)
      );

      const uploadPromises = newImagesToUpload.map((imageUrl) =>
        cloudinary.uploader.upload(imageUrl, {
          folder: "LIPCI/products",
        })
      );
      const uploadedImages = await Promise.all(uploadPromises);
      return uploadedImages.map((upload) => upload.secure_url);
    };

    const newImageUrls: string[] = [];

    if (images && images.length > 0) {
      const uploadedImages = await handleImageUpload(images);
      newImageUrls.push(...uploadedImages);
    }

    const imagesToKeep = existingProduct.images.filter(
      (img) => !imagesToRemove || !imagesToRemove.includes(img)
    );
    const combinedImages = [...imagesToKeep, ...newImageUrls];

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        code,
        price,
        description,
        images: combinedImages,
      },
    });

    await prisma.productSubcategory.deleteMany({
      where: { productId: id },
    });

    const createSubcategoryRelations = subcategoryIds.map(
      (subcategoryId: string) =>
        prisma.productSubcategory.create({
          data: {
            productId: id,
            subcategoryId,
          },
        })
    );

    await Promise.all(createSubcategoryRelations);

    if (imagesToRemove) {
      const deleteImagePromises = imagesToRemove.map((imageUrl: string) => {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        return cloudinary.uploader.destroy(`LIPCI/products/${publicId}`);
      });
      await Promise.all(deleteImagePromises);
    }

    return NextResponse.json(
      { message: "Продуктът е обновен успешно!", category: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Грешка при обновяване на продукта:", error);
    return NextResponse.json(
      { message: "Възникна грешка! Моля, опитайте отново!" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
      { message: "Продуктът е изтрит успешно!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при изтриване на продукта:", error);
    return NextResponse.json(
      { message: "Възникна грешка при изтриване на продукта!" },
      { status: 500 }
    );
  }
}
