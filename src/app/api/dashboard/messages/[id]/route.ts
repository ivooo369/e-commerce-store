import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

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
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при изтриване на съобщението!" },
      { status: 500 }
    );
  }
}
