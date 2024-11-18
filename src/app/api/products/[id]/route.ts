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

    if (!name || !code || !price || !subcategoryIds) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newImageUrls = [];
    if (images && images.length > 0) {
      const existingImageUrls = existingProduct.images || [];
      const newImagesToUpload = images.filter(
        (img: string) => !existingImageUrls.includes(img)
      );

      const uploadPromises = newImagesToUpload.map((imageUrl: string) =>
        cloudinary.uploader.upload(imageUrl, {
          folder: "LIPCI/products",
        })
      );
      const uploadedImages = await Promise.all(uploadPromises);
      newImageUrls.push(...uploadedImages.map((upload) => upload.secure_url));
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
      (subcategoryId: string) => {
        return prisma.productSubcategory.create({
          data: {
            productId: id,
            subcategoryId,
          },
        });
      }
    );

    await Promise.all(createSubcategoryRelations);

    if (imagesToRemove) {
      const deleteImagePromises = imagesToRemove.map((imageUrl: string) => {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        return cloudinary.uploader.destroy(`LIPCI/products/${publicId}`);
      });
      await Promise.all(deleteImagePromises);
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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
