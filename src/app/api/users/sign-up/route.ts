import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/lib/email";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, city, address, phone, password } =
      await req.json();

    const existingUser = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Потребител с този имейл вече съществува!" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 1);

    const newUser = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        city,
        address,
        phone,
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
      { expiresIn: "1h" }
    );

    await sendVerificationEmail(email, verificationToken);

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
    console.error("Възникна грешка при регистрацията:", error);
    return NextResponse.json(
      { message: "Възникна грешка при регистрацията!" },
      { status: 500 }
    );
  }
}
