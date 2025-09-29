import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/services/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]?.trim();
    const { currentPassword, newPassword } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "Токенът за оторизация липсва!" },
        { status: 401 }
      );
    }

    if (currentPassword.trim() === "" || newPassword.trim() === "") {
      return NextResponse.json(
        { message: "Паролата не може да бъде празна!" },
        { status: 400 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    let decodedToken: JwtPayload | string;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json(
        { message: "Невалиден или изтекъл токен!" },
        { status: 401 }
      );
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Моля, попълнете всички задължителни полета!" },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 8) {
      return NextResponse.json(
        { message: "Новата парола трябва да бъде поне 8 знака!" },
        { status: 400 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { id: decodedToken.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Потребителят не е намерен!" },
        { status: 404 }
      );
    }

    if (typeof user.password !== "string") {
      return NextResponse.json(
        { message: "Невалиден формат на паролата!" },
        { status: 500 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword.trim(),
      user.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: "Текущата парола е грешна!" },
        { status: 400 }
      );
    }

    if (currentPassword.trim() === newPassword.trim()) {
      return NextResponse.json(
        { message: "Новата парола не може да бъде същата като текущата!" },
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
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при смяна на паролата!" },
      { status: 500 }
    );
  }
}
