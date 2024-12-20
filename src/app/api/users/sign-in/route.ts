import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const existingUser = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Невалиден имейл или парола!" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Невалиден имейл или парола!" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Успешен вход!" }, { status: 200 });
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
