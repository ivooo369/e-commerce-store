import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/lib/email-templates/verifyEmail";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";
import {
  universalRateLimit,
  createRateLimitResponse,
} from "@/lib/utils/rateLimit";
import {
  verifyTurnstileToken,
  createTurnstileErrorResponse,
} from "@/services/turnstileService";

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

    const {
      firstName,
      lastName,
      email,
      city,
      address,
      phone,
      password,
      captchaToken,
    } = await req.json();

    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();
    const trimmedCity = city?.trim();
    const trimmedAddress = address?.trim();
    const trimmedPhone = phone?.trim();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedEmail ||
      !trimmedPassword ||
      !captchaToken
    ) {
      return NextResponse.json(
        { message: "Всички задължителни полета трябва да бъдат попълнени!" },
        { status: 400 }
      );
    }

    const isCaptchaValid = await verifyTurnstileToken(captchaToken);
    if (!isCaptchaValid) {
      return createTurnstileErrorResponse();
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { message: "Невалиден формат на имейл адреса!" },
        { status: 400 }
      );
    }

    if (trimmedPassword.length < 8) {
      return NextResponse.json(
        { message: "Паролата трябва да бъде поне 8 символа!" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.customer.findUnique({
      where: { email: trimmedEmail },
    });
    if (existingUser) {
      if (existingUser.googleId) {
        return NextResponse.json(
          {
            message: "Този имейл вече е свързан с Google акаунт!",
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { message: "Потребител с този имейл вече съществува!" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 1);

    const newUser = await prisma.customer.create({
      data: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        password: hashedPassword,
        city: trimmedCity,
        address: trimmedAddress,
        phone: trimmedPhone,
        isVerified: false,
        verificationToken,
        tokenExpiration,
      },
    });

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    await sendVerificationEmail(trimmedEmail, verificationToken);

    return NextResponse.json(
      {
        message:
          "Регистрацията Ви е почти готова! Моля, отворете имейла си и кликнете върху линка за верификация!",
        token,
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при регистрацията!" },
      { status: 500 }
    );
  }
}
