import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  try {
    let { firstName, lastName, email, city, address, phone, password } =
      await req.json();

    firstName = firstName?.trim();
    lastName = lastName?.trim();
    email = email?.trim();
    password = password?.trim();
    city = city?.trim();
    address = address?.trim();
    phone = phone?.trim();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Всички задължителни полета трябва да бъдат попълнени!" },
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

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Паролата трябва да бъде поне 8 символа!" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.customer.findUnique({ where: { email } });
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
      { expiresIn: "24h" }
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
