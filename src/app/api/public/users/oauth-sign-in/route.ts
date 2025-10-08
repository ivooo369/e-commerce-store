import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Имейлът е задължителен!" },
        { status: 400 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        googleId: true,
      },
    });

    if (!user || !user.googleId) {
      return NextResponse.json(
        { message: "Google OAuth потребител не е намерен!" },
        { status: 404 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return NextResponse.json(
      {
        message: "Успешен вход с Google акаунт!",
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        isLoggedIn: true,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при влизане с Google акаунт!" },
      { status: 500 }
    );
  }
}
