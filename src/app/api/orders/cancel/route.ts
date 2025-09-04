import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendOrderStatusNotification } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    const currentOrder = await prisma.$queryRaw<
      { status: string; name: string; email: string }[]
    >`
      SELECT status, name, email FROM "public"."orders" WHERE id = ${orderId} LIMIT 1
    `;

    const currentStatus = currentOrder[0].status;

    if (currentStatus !== "pending") {
      return NextResponse.json({ status: currentStatus }, { status: 200 });
    }

    await prisma.$executeRaw`
      UPDATE "public"."orders"
      SET status = 'cancelled',
          updated_at = NOW()
      WHERE id = ${orderId} AND status = 'pending'
    `;

    await sendOrderStatusNotification(
      orderId,
      "cancelled",
      currentOrder[0].name,
      currentOrder[0].email
    );

    return NextResponse.json({ status: "cancelled" }, { status: 200 });
  } catch (error) {
    console.error("Възникна грешка при отказване на поръчката:", error);
    return NextResponse.json(
      { error: "Възникна грешка при отказване на поръчката!" },
      { status: 500 }
    );
  }
}
