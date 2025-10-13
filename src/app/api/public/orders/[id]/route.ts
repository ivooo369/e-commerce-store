import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { getDeliveryMethod, SHIPPING_COSTS } from "@/lib/utils/delivery";
import * as Sentry from "@sentry/nextjs";
import type { OrderItem, OrderResponse } from "@/lib/types/interfaces";

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
      SELECT *, created_at as "createdAt", additional_info as "additionalInfo", is_completed as "isCompleted" 
      FROM "public"."orders"
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
      Sentry.captureException(error);
      items = [];
    }

    const total = items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);

    const deliveryMethod = order.address
      ? getDeliveryMethod(order.address)
      : "ADDRESS";
    const shippingCost =
      SHIPPING_COSTS[deliveryMethod as keyof typeof SHIPPING_COSTS] || 0;

    const response = {
      id: order.id,
      name: order.name,
      email: order.email,
      phone: order.phone,
      city: order.city,
      address: order.address,
      status: order.status || "processing",
      total: total,
      shippingCost: shippingCost,
      deliveryMethod: "econt",
      additionalInfo: order.additionalInfo || null,
      isCompleted: order.isCompleted || false,
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
    Sentry.captureException(error);
    return NextResponse.json(
      {
        message: "Възникна грешка при извличане на данните за поръчката!",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
