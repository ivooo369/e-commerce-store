import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";
import {
  universalRateLimit,
  createRateLimitResponse,
} from "@/lib/utils/rateLimit";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const rateLimitResult = universalRateLimit(req);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.remaining,
        rateLimitResult.resetTime
      );
    }

    const { token, newPassword } = await req.json();

    if (!token || token.trim() === "") {
      return NextResponse.json(
        { message: "Токенът за смяна на паролата липсва!" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.trim() === "") {
      return NextResponse.json(
        { message: "Моля, въведете нова парола!" },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 8) {
      return NextResponse.json(
        { message: "Новата парола трябва да бъде поне 8 знака!" },
        { status: 400 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    let decodedToken: JwtPayload;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        { message: "Невалиден или изтекъл токен за смяна на паролата!" },
        { status: 401 }
      );
    }

    if (decodedToken.action !== "password-reset") {
      return NextResponse.json(
        { message: "Невалиден тип токен!" },
        { status: 400 }
      );
    }

    const userEmail = decodedToken.email;
    if (!userEmail) {
      return NextResponse.json(
        { message: "Невалиден токен - липсва имейл адрес!" },
        { status: 400 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { email: userEmail },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Потребителят не е намерен!" },
        { status: 404 }
      );
    }

    if (typeof user.password === "string") {
      const isSamePassword = await bcrypt.compare(
        newPassword.trim(),
        user.password
      );
      if (isSamePassword) {
        return NextResponse.json(
          { message: "Новата парола не може да бъде същата като текущата!" },
          { status: 400 }
        );
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);

    await prisma.customer.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json(
      {
        message:
          "Паролата е сменена успешно! Можете да влезете с новата си парола.",
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при смяна на паролата!" },
      { status: 500 }
    );
  }
}
