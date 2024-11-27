import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "@/app/lib/cloudinary.config";

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
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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

    // Проверка за задължителни полета
    if (!name || !code || !price || !subcategoryIds) {
      return NextResponse.json(
        { error: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    // Проверка за валидна цена
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "Цената трябва да бъде валидно число и по-голямо от 0!" },
        { status: 400 }
      );
    }

    // Проверка за поне една снимка
    if (images && (!Array.isArray(images) || images.length === 0)) {
      return NextResponse.json(
        { error: "Трябва да качите поне едно изображение на продукта!" },
        { status: 400 }
      );
    }

    // Проверка дали кодът вече съществува (с изключение на текущия продукт)
    const existingProductWithCode = await prisma.product.findUnique({
      where: { code },
    });

    if (existingProductWithCode && existingProductWithCode.id !== id) {
      return NextResponse.json(
        {
          error: "Продукт с този код вече съществува!",
        },
        { status: 400 }
      );
    }

    // Проверка дали продуктът съществува
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Продуктът не е намерен!" },
        { status: 404 }
      );
    }

    // Функция за качване на нови изображения
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

    // Съществуващи снимки за запазване
    const imagesToKeep = existingProduct.images.filter(
      (img) => !imagesToRemove || !imagesToRemove.includes(img)
    );
    const combinedImages = [...imagesToKeep, ...newImageUrls];

    // Обновяване на продукта
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

    // Изтриване на връзки с подкатегории
    await prisma.productSubcategory.deleteMany({
      where: { productId: id },
    });

    // Създаване на нови връзки с подкатегории
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

    // Изтриване на снимки, които трябва да бъдат премахнати
    if (imagesToRemove) {
      const deleteImagePromises = imagesToRemove.map((imageUrl: string) => {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        return cloudinary.uploader.destroy(`LIPCI/products/${publicId}`);
      });
      await Promise.all(deleteImagePromises);
    }

    return NextResponse.json(
      {
        message: "Продуктът е актуализиран успешно!",
        category: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Грешка при обновяване на продукта:", error);
    return NextResponse.json(
      { error: "Възникна грешка! Моля, опитайте отново!" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
  } finally {
    await prisma.$disconnect();
  }
}
