import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    const order = await prisma.$queryRaw<
      { status: string; name: string; email: string; created_at: Date }[]
    >`
      SELECT status, name, email, created_at 
      FROM "public"."orders" 
      WHERE id = ${orderId} 
      LIMIT 1
    `;

    const orderData = order[0];
    const orderDate = orderData.created_at;

    return NextResponse.json(
      {
        status: orderData.status,
        orderDate: orderDate.toISOString(),
        name: orderData.name,
        email: orderData.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Възникна грешка при проверка на статуса на поръчката:",
      error
    );
    return NextResponse.json(
      { error: "Възникна грешка при проверка на статуса на поръчката!" },
      { status: 500 }
    );
  }
}
