import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Липсва токен за потвърждение!" },
        { status: 400 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { verificationToken: token },
    });

    if (!user || !user.tokenExpiration || user.tokenExpiration < new Date()) {
      return NextResponse.json(
        { message: "Токенът е невалиден или изтекъл!" },
        { status: 400 }
      );
    }

    const currentTime = new Date();
    if (user.tokenExpiration < currentTime) {
      return NextResponse.json(
        {
          message: "Токенът е изтекъл! Моля, подновете заявката за нов токен!",
        },
        { status: 400 }
      );
    }

    await prisma.customer.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiration: null,
      },
    });

    return NextResponse.json(
      {
        message: "Вашият имейл беше успешно потвърден!",
        user: { firstName: user.firstName },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при потвърждаване на имейла:", error);
    return NextResponse.json(
      { message: "Възникна грешка при потвърждаване на имейла!" },
      { status: 500 }
    );
  }
}
