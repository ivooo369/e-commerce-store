import { NextResponse } from "next/server";
import { Order } from "@prisma/client";
import nodemailer from "nodemailer";
import { getDeliveryMethod, calculateShippingCost } from "@/lib/utils/delivery";
import { OrderItem } from "@/lib/types/interfaces";
import prisma from "@/lib/services/prisma";
import {
  adminOrderEmail,
  customerOrderEmail,
} from "@/lib/email-templates/orderEmails";
import * as Sentry from "@sentry/nextjs";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Не сте влезли в акаунта си!" },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      userId = payload.userId;
    } catch (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        { message: "Невалиден токен!" },
        { status: 401 }
      );
    }

    const orders = await prisma.$queryRaw<Order[]>`
      SELECT 
        id,
        created_at as "createdAt",
        status,
        items,
        address
      FROM orders
      WHERE customer_id = ${userId}
      ORDER BY created_at DESC
    `;

    const processedOrders = orders.map((order: Order) => {
      const items = order.items as unknown as OrderItem[] | null;
      const productsTotal =
        items?.reduce((sum, item) => {
          const price = typeof item.price === "number" ? item.price : 0;
          const quantity =
            typeof item.quantity === "number" ? item.quantity : 1;
          return sum + price * quantity;
        }, 0) || 0;

      const deliveryMethod = getDeliveryMethod(order.address || "");
      const shippingCost = calculateShippingCost(deliveryMethod);
      const total = productsTotal + shippingCost;

      const createdAt = order.createdAt
        ? new Date(order.createdAt).toISOString()
        : new Date().toISOString();

      return {
        ...order,
        items: items || [],
        productsTotal,
        shippingCost,
        total,
        createdAt,
      };
    });

    return NextResponse.json(processedOrders);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при зареждане на поръчките!" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, email, city, address, phone, additionalInfo } = body;
    const { items, customerId } = body;

    name = name?.trim();
    email = email?.trim();
    city = city?.trim();
    address = address?.trim();
    phone = phone?.trim();
    additionalInfo = additionalInfo?.trim();

    if (
      !name ||
      !email ||
      !city ||
      !address ||
      !phone ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { message: "Моля, попълнете всички задължителни полета!" },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Невалиден формат на имейл адреса!" },
        { status: 400 }
      );
    }

    const productsTotal = items.reduce((sum: number, item: OrderItem) => {
      const price =
        typeof item.price !== "undefined"
          ? typeof item.price === "number"
            ? item.price
            : parseFloat(item.price) || 0
          : typeof item.product.price === "number"
          ? item.product.price
          : parseFloat(item.product.price) || 0;
      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : parseInt(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);

    const deliveryMethod = getDeliveryMethod(address);
    const shippingCost = calculateShippingCost(deliveryMethod);
    const orderTotal = productsTotal + shippingCost;

    const orderItems = items.map((item) => {
      const price =
        typeof item.price !== "undefined"
          ? typeof item.price === "number"
            ? item.price
            : parseFloat(item.price) || 0
          : typeof item.product.price === "number"
          ? item.product.price
          : parseFloat(item.product.price) || 0;

      return {
        product: {
          id: item.product.id,
          name: item.product.name,
          price: price,
          code: item.product.code || "",
          images: Array.isArray(item.product.images) ? item.product.images : [],
        },
        quantity:
          typeof item.quantity === "number"
            ? item.quantity
            : parseInt(item.quantity) || 1,
        price: price,
      };
    });

    const formattedAddress =
      deliveryMethod === "ADDRESS" ? `До адрес: ${address}` : address;

    const [order] = (await prisma.$queryRaw`
      INSERT INTO "public"."orders" (
        "id",
        "name",
        "email",
        "city",
        "address",
        "phone",
        "additional_info",
        "items",
        "status",
        "customer_id",
        "created_at",
        "updated_at"
      ) VALUES (
        gen_random_uuid(),
        ${name},
        ${email},
        ${city},
        ${formattedAddress},
        ${phone},
        ${additionalInfo || null},
        ${JSON.stringify(orderItems)}::jsonb,
        'pending',
        ${customerId || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `) as OrderItem[];

    const orderId = order.id as string;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const emailData = {
      orderId,
      name,
      email,
      phone,
      city,
      address: formattedAddress,
      additionalInfo,
      items: orderItems,
      orderTotal,
      shippingCost,
      confirmUrl: `${baseUrl}/orders/confirm?orderId=${orderId}`,
      cancelUrl: `${baseUrl}/orders/cancel?orderId=${orderId}`,
    };

    const emailPromises = [];

    emailPromises.push(
      transporter.sendMail({
        from: `"Lipci Design Studio" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `Нова поръчка #${orderId.substring(0, 8).toUpperCase()}`,
        html: adminOrderEmail(emailData),
      })
    );

    emailPromises.push(
      transporter.sendMail({
        from: `"Lipci Design Studio" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Потвърждение на поръчка #${orderId
          .substring(0, 8)
          .toUpperCase()}`,
        html: customerOrderEmail(emailData),
      })
    );

    await Promise.all(emailPromises);

    return NextResponse.json(
      {
        message: "Поръчката ви е приета успешно!",
        orderId: order.id,
      },
      { status: 201 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        message: "Възникна грешка при обработка на поръчката!",
      },
      { status: 500 }
    );
  }
}
