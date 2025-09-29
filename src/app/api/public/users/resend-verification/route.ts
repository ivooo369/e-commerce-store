import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/services/prisma";
import { sendVerificationEmail } from "@/lib/email-templates/verifyEmail";

export async function POST(req: Request) {
  try {
    let { email } = await req.json();

    email = email?.trim();

    if (!email) {
      return NextResponse.json(
        { message: "Имейл адресът е задължителен!" },
        { status: 400 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Потребител с този имейл не е намерен!" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "Този акаунт вече е верифициран!" },
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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 1);

    await prisma.customer.update({
      where: { id: user.id },
      data: {
        verificationToken,
        tokenExpiration,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      {
        message:
          "Изпратихме Ви нов имейл за потвърждение. Моля, проверете имейла си!",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при изпращане на имейла за потвърждение!" },
      { status: 500 }
    );
  }
}
