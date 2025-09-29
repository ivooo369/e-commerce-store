import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { sendOrderStatusNotification } from "@/lib/email-templates/orderEmails";

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
      SET status = 'confirmed',
          updated_at = NOW()
      WHERE id = ${orderId} AND status = 'pending'
      RETURNING id;
    `;

    if (result) {
      await sendOrderStatusNotification(
        orderId,
        "confirmed",
        currentOrder[0].name,
        currentOrder[0].email
      );
    }

    return NextResponse.json({ status: "confirmed" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Възникна грешка при потвърждаване на поръчката!" },
      { status: 500 }
    );
  }
}
