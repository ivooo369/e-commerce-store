import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { sendOrderStatusNotification } from "@/lib/email-templates/orderEmails";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  try {
    let { orderId } = await request.json();
    orderId = orderId?.trim();

    if (!orderId) {
      return NextResponse.json(
        { error: "Невалиден ID на поръчката!" },
        { status: 400 }
      );
    }

    const currentOrder = await prisma.$queryRaw<
      { status: string; name: string; email: string }[]
    >`
      SELECT status, name, email FROM "public"."orders" WHERE id = ${orderId} LIMIT 1
    `;

    const currentStatus = currentOrder[0].status;

    if (currentStatus !== "pending") {
      return NextResponse.json({ status: currentStatus }, { status: 200 });
    }

    const result = await prisma.$executeRaw`
      UPDATE "public"."orders"
      SET status = 'cancelled',
          updated_at = NOW()
      WHERE id = ${orderId} AND status = 'pending'
      RETURNING id;
    `;

    if (result) {
      await sendOrderStatusNotification(
        orderId,
        "cancelled",
        currentOrder[0].name,
        currentOrder[0].email
      );
    }

    return NextResponse.json({ status: "cancelled" }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Възникна грешка при отказване на поръчката!" },
      { status: 500 }
    );
  }
}
