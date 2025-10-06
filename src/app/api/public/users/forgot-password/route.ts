import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/services/prisma";
import { sendPasswordResetEmail } from "@/lib/email-templates/passwordResetEmail";
import * as Sentry from "@sentry/nextjs";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || email.trim() === "") {
      return NextResponse.json(
        { message: "Моля, въведете имейл адрес!" },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { message: "Моля, въведете валиден имейл адрес!" },
        { status: 400 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { email: email.trim() },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const successMessage =
      "На посочения имейл адрес е изпратено съобщение с инструкции за смяна на вашата парола.";

    if (user) {
      const resetToken = jwt.sign(
        {
          email: user.email,
          action: "password-reset",
          userId: user.id,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/user/reset-password?token=${resetToken}`;

      await sendPasswordResetEmail(
        user.email ?? "",
        user.firstName ?? "",
        resetUrl
      );
    }

    return NextResponse.json(
      {
        message: successMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при изпращане на имейла!" },
      { status: 500 }
    );
  }
}
