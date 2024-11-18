import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory, { status: 200 });
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategory" },
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
    const { name, code, categoryId } = body;

    if (!name || !code || !categoryId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const updatedSubcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name,
        code,
        categoryId,
      },
    });

    return NextResponse.json(updatedSubcategory, { status: 200 });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory" },
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
      { error: "Subcategory ID is required" },
      { status: 400 }
    );
  }

  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    for (const product of subcategory.products) {
      const otherSubcategory = await prisma.subcategory.findUnique({
        where: { name: "Други" },
      });

      if (!otherSubcategory) {
        return NextResponse.json(
          { error: "Other subcategory not found" },
          { status: 404 }
        );
      }

      await prisma.productSubcategory.updateMany({
        where: {
          productId: product.productId,
          subcategoryId: subcategory.id,
        },
        data: { subcategoryId: otherSubcategory.id },
      });
    }

    await prisma.productSubcategory.deleteMany({
      where: { subcategoryId: subcategory.id },
    });

    await prisma.subcategory.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Subcategory deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
