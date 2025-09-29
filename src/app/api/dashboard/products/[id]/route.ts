import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import cloudinary from "@/lib/config/cloudinary.config";

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
        { message: "Продуктът не е намерен! Възможно е да не е в наличност." },
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
  } catch {
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
    const { price, images, subcategoryIds, imagesToRemove } = body;
    let { name, code, description } = body;

    name = name?.trim();
    code = code?.trim();
    description = description?.trim();

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

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { message: "Моля, качете поне едно изображение на продукта!" },
        { status: 400 }
      );
    }

    const newImages = images.filter(
      (imageUrl) => typeof imageUrl === "string" && imageUrl.startsWith("data:")
    );

    for (const imageUrl of newImages) {
      const base64Content = imageUrl.split(",")[1];
      if (base64Content) {
        const sizeInBytes = (base64Content.length * 3) / 4;
        if (sizeInBytes > 2 * 1024 * 1024) {
          return NextResponse.json(
            {
              message:
                "Едно или повече изображения надвишават максималния размер от 2 MB!",
            },
            { status: 400 }
          );
        }
      }
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
        { message: "Продуктът не е намерен! Възможно е да не е в наличност." },
        { status: 404 }
      );
    }

    const existingImageUrls = existingProduct.images || [];
    const imagesToKeep = existingImageUrls.filter(
      (img) => !imagesToRemove || !imagesToRemove.includes(img)
    );

    const newImagesToUpload = images.filter(
      (img) => typeof img === "string" && img.startsWith("data:")
    );

    const uploadedImageUrls: string[] = [];

    if (newImagesToUpload.length > 0) {
      try {
        const uploadPromises = newImagesToUpload.map(async (imageUrl) => {
          const result = await cloudinary.uploader.upload(imageUrl, {
            folder: "LIPCI/products",
          });
          return result.secure_url;
        });

        const uploadResults = await Promise.all(uploadPromises);
        uploadedImageUrls.push(...uploadResults);
      } catch {
        return NextResponse.json(
          { message: "Възникна грешка при качване на изображенията!" },
          { status: 500 }
        );
      }
    }

    const combinedImages = [...imagesToKeep, ...uploadedImageUrls];

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

    if (imagesToRemove && imagesToRemove.length > 0) {
      try {
        const deleteImagePromises = imagesToRemove.map((imageUrl: string) => {
          const publicId = imageUrl.split("/").pop()?.split(".")[0];
          if (publicId) {
            return cloudinary.uploader.destroy(`LIPCI/products/${publicId}`);
          }
          return Promise.resolve();
        });
        await Promise.all(deleteImagePromises);
      } catch {
        throw new Error("Възникна грешка при изтриване на стари изображения!");
      }
    }

    return NextResponse.json(
      { message: "Продуктът е обновен успешно!", product: updatedProduct },
      { status: 200 }
    );
  } catch {
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

    const product = await prisma.product.findUnique({
      where: { id },
      include: { favorites: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не е намерен! Възможно е да не е в наличност." },
        { status: 404 }
      );
    }

    if (product.favorites && product.favorites.length > 0) {
      await prisma.favorite.deleteMany({
        where: { productId: id },
      });
    }

    if (product.images && product.images.length > 0) {
      const deleteImagePromises = product.images.map((imageUrl) => {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        return publicId
          ? cloudinary.uploader.destroy(`LIPCI/products/${publicId}`)
          : Promise.resolve();
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
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при изтриване на продукта!" },
      { status: 500 }
    );
  }
}
