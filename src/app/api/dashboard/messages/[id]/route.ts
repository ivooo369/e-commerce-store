import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Съобщението е изтрито успешно!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при изтриване на съобщението:", error);
    return NextResponse.json(
      { error: "Възникна грешка при изтриване на съобщението!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
