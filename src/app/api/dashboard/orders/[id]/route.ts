import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { isCompleted } = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        isCompleted,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        isCompleted: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Възникна грешка при актуализиране на поръчката:", error);
    return NextResponse.json(
      { error: "Възникна грешка при актуализиране на поръчката!" },
      { status: 500 }
    );
  }
}
