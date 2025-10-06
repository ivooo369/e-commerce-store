import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { isCompleted } = await request.json();

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "isCompleted трябва да бъде булева стойност!" },
        { status: 400 }
      );
    }

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
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Възникна грешка при актуализиране на поръчката!" },
      { status: 500 }
    );
  }
}
