import cloudinary from "@/app/lib/cloudinary.config";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const subcategoryIds = category.subcategories.map((sub) => sub.id);

    return NextResponse.json(
      {
        name: category.name,
        code: category.code,
        imageUrl: category.imageUrl,
        subcategoryIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
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
    const { name, code, imageUrl, imageToRemove } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    let updatedImageUrl = existingCategory.imageUrl;

    if (imageUrl && imageUrl !== existingCategory.imageUrl) {
      if (existingCategory.imageUrl && imageToRemove) {
        const publicId = existingCategory.imageUrl
          .split("/")
          .pop()
          ?.split(".")[0];
        console.log("Public ID to remove:", publicId);

        if (publicId) {
          const result = await cloudinary.uploader.destroy(
            `LIPCI/categories/${publicId}`
          );
          console.log("Cloudinary delete result:", result);
        }
      }

      const uploadResult = await cloudinary.uploader.upload(imageUrl, {
        folder: "LIPCI/categories",
      });
      updatedImageUrl = uploadResult.secure_url;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        code,
        imageUrl: updatedImageUrl,
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Category ID is required" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { subcategories: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const otherCategory = await prisma.subcategory.findUnique({
      where: { name: "Други" },
    });

    if (!otherCategory) {
      return NextResponse.json(
        { error: "Other category not found" },
        { status: 404 }
      );
    }

    for (const subcategory of category.subcategories) {
      const products = await prisma.productSubcategory.findMany({
        where: { subcategoryId: subcategory.id },
      });

      for (const product of products) {
        const otherSubcategoryLinks = await prisma.productSubcategory.count({
          where: {
            productId: product.productId,
            NOT: { subcategoryId: subcategory.id },
          },
        });

        if (otherSubcategoryLinks === 0) {
          await prisma.productSubcategory.updateMany({
            where: {
              productId: product.productId,
              subcategoryId: subcategory.id,
            },
            data: { subcategoryId: otherCategory.id },
          });
        }
      }

      await prisma.productSubcategory.deleteMany({
        where: { subcategoryId: subcategory.id },
      });

      await prisma.subcategory.delete({
        where: { id: subcategory.id },
      });
    }

    if (category?.imageUrl) {
      const publicId = category.imageUrl.split("/").pop()?.split(".")[0];
      await cloudinary.uploader.destroy(`LIPCI/categories/${publicId}`);
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Category and subcategories deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
