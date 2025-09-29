import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DecodedToken } from "@/lib/types/interfaces";
import prisma from "@/lib/services/prisma";
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Токенът за оторизация липсва!" },
        { status: 401 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    let decoded: DecodedToken;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json(
        { message: "Невалиден или изтекъл токен!" },
        { status: 401 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { id: decoded.userId },
      select: { firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Потребителят не е намерен!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { firstName: user.firstName, lastName: user.lastName },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Възникна грешка при извличане на данните на потребителя!" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    let { email, password } = await req.json();

    email = email?.trim();
    password = password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Имейлът и паролата са задължителни!" },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Невалиден формат на имейл адреса!" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!existingUser || typeof existingUser.password !== "string") {
      return NextResponse.json(
        { message: "Неправилен имейл или парола!" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Неправилен имейл или парола!" },
        { status: 400 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json(
      {
        message: "Успешен вход!",
        token,
        user: {
          id: existingUser.id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при влизане в потребителския акаунт!" },
      { status: 500 }
    );
  }
}
