import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import nodemailer from "nodemailer";
import { contactEmailHtml } from "@/lib/email-templates/contactEmail";
import * as Sentry from "@sentry/nextjs";
import {
  universalRateLimit,
  createRateLimitResponse,
} from "@/lib/utils/rateLimit";
import {
  verifyTurnstileToken,
  createTurnstileErrorResponse,
} from "@/services/turnstileService";

export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const rateLimitResult = universalRateLimit(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.remaining,
        rateLimitResult.resetTime
      );
    }

    const body = await request.json();
    const { name, email, title, content, captchaToken } = body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedTitle = title?.trim();
    const trimmedContent = content?.trim();

    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedTitle ||
      !trimmedContent ||
      !captchaToken
    ) {
      return NextResponse.json(
        { message: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    const isCaptchaValid = await verifyTurnstileToken(captchaToken);
    if (!isCaptchaValid) {
      return createTurnstileErrorResponse();
    }

    if (trimmedName.length > 100) {
      return NextResponse.json(
        { message: "Името не може да надвишава 100 символа!" },
        { status: 400 }
      );
    }

    if (trimmedEmail.length > 255) {
      return NextResponse.json(
        { message: "Имейлът не може да надвишава 255 символа!" },
        { status: 400 }
      );
    }

    if (trimmedTitle.length > 100) {
      return NextResponse.json(
        { message: "Темата не може да надвишава 100 символа!" },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { message: "Съобщението не може да надвишава 500 символа!" },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { message: "Невалиден формат на имейл адреса!" },
        { status: 400 }
      );
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email: trimmedEmail,
      },
    });

    const newMessage = await prisma.message.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        title: trimmedTitle,
        content: trimmedContent,
        customerId: existingCustomer ? existingCustomer.id : null,
      },
    });

    await transporter.sendMail({
      from: `"${trimmedName}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: trimmedEmail,
      subject: trimmedTitle,
      text: trimmedContent,
      html: contactEmailHtml({
        name: trimmedName,
        email: trimmedEmail,
        title: trimmedTitle,
        content: trimmedContent,
      }),
    });

    return NextResponse.json(
      { message: "Съобщението е изпратено успешно!", newMessage },
      { status: 201 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при обработка на съобщението!" },
      { status: 500 }
    );
  }
}
