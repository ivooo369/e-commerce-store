import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Токенът за оторизация липсва!" },
        { status: 401 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    let decodedToken: JwtPayload | string;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json(
        { error: "Невалиден или изтекъл токен!" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Моля, попълнете всички полета!" },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 8) {
      return NextResponse.json(
        { error: "Новата парола трябва да бъде поне 8 знака!" },
        { status: 400 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { id: decodedToken.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Потребителят не е намерен!" },
        { status: 404 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword.trim(),
      user.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Текущата парола е грешна!" },
        { status: 400 }
      );
    }

    if (currentPassword.trim() === newPassword.trim()) {
      return NextResponse.json(
        { error: "Новата парола не може да бъде същата като текущата!" },
        { status: 400 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);

    await prisma.customer.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json(
      { message: "Паролата е сменена успешно!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Грешка при смяна на парола:", error);
    return NextResponse.json(
      { error: "Възникна грешка при смяна на паролата!" },
      { status: 500 }
    );
  }
}
