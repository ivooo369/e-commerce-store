import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderItem, OrderResponse } from "@/lib/interfaces";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { message: "Невалиден номер на поръчка!" },
        { status: 400 }
      );
    }

    const [order] = (await prisma.$queryRaw`
      SELECT *, created_at as "createdAt" FROM "public"."orders"
      WHERE id::text = ${id}
    `) as OrderResponse[];

    if (!order) {
      return NextResponse.json(
        { message: "Поръчката не беше намерена!" },
        { status: 404 }
      );
    }

    let items: OrderItem[] = [];

    try {
      const parsedItems =
        typeof order.items === "string" ? JSON.parse(order.items) : order.items;

      if (Array.isArray(parsedItems)) {
        items = parsedItems.map((item) => ({
          product: {
            id: item.product?.id || "",
            name: item.product?.name,
            code: item.product?.code || "",
            price: typeof item.price === "number" ? item.price : 0,
            description: item.product?.description || "",
            images: Array.isArray(item.product?.images)
              ? item.product.images
              : [],
          },
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
          price: typeof item.price === "number" ? item.price : 0,
        }));
      }
    } catch (error) {
      console.error("Възникна грешка:", error);
      items = [];
    }

    const total = items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);

    const response = {
      id: order.id,
      customerName: order.name,
      email: order.email,
      phone: order.phone,
      city: order.city,
      address: order.address,
      status: order.status || "processing",
      total: total,
      deliveryMethod: "econt",
      trackingNumber: null as string | null,
      additionalInfo: order.additionalInfo,
      createdAt: order.createdAt,
      items: items.map((item) => ({
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          code: item.product.code,
          price: item.product.price,
          images: item.product.images || [],
        },
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Възникна грешка при извличане на данните за поръчката:",
      error
    );
    return NextResponse.json(
      {
        message: "Възникна грешка при извличане на данните за поръчката!",
        error: error instanceof Error && error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
