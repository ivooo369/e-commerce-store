import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Липсва ID на потребителя!" },
        { status: 400 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { id: id },
    });
    console.log(user);
    if (!user) {
      return NextResponse.json(
        { message: "Потребителят не е намерен!" },
        { status: 404 }
      );
    }

    await prisma.customer.delete({ where: { id: id } });

    return NextResponse.json(
      { message: "Акаунтът беше успешно изтрит!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при изтриването на акаунта:", error);
    return NextResponse.json(
      { message: "Възникна грешка при изтриването на акаунта!" },
      { status: 500 }
    );
  }
}
