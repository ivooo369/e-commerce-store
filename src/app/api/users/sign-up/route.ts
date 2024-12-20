import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, city, address, phone } =
      await req.json();

    const existingUser = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Потребител с този имейл вече съществува!" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        city,
        address,
        phone,
      },
    });

    return NextResponse.json(
      { message: "Успешна регистрация!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при регистрацията:", error);
    return NextResponse.json(
      { error: "Възникна грешка при регистрацията!" },
      { status: 500 }
    );
  }
}
