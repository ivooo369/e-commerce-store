import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

interface DecodedToken {
  userId: string;
  email: string;
}

export async function GET(req: Request) {
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

    let decoded: DecodedToken;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json(
        { error: "Невалиден или изтекъл токен!" },
        { status: 401 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { id: decoded.userId },
      select: { firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Потребителят не е намерен!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { firstName: user.firstName, lastName: user.lastName },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Възникна грешка при извличане на данните на потребителя:",
      error
    );
    return NextResponse.json(
      { error: "Възникна грешка при извличане на данните на потребителя!" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

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

    if (!existingUser) {
      return NextResponse.json(
        { error: "Невалиден имейл или парола!" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      existingUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Невалиден имейл или парола!" },
        { status: 400 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
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
  } catch (error) {
    console.error(
      "Възникна грешка при влизане в потребителския акаунт:",
      error
    );
    return NextResponse.json(
      { error: "Възникна грешка при влизане в потребителския акаунт!" },
      { status: 500 }
    );
  }
}
