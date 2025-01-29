import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

interface DecodedToken {
  userId: string;
  email: string;
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Токенът за оторизация липсва!" },
        { status: 401 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    let decoded: { userId: string };

    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json(
        { message: "Невалиден или изтекъл токен!" },
        { status: 401 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Потребителят не е намерен!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.city,
        address: user.address,
        phone: user.phone,
        isVerified: user.isVerified,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Възникна грешка при извличане на потребителската информация:",
      error
    );
    return NextResponse.json(
      { message: "Възникна грешка при обработката на заявката!" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Токенът за оторизация липсва!" },
        { status: 401 }
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    let decoded: DecodedToken;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json(
        { message: "Невалиден или изтекъл токен!" },
        { status: 401 }
      );
    }

    const { firstName, lastName, email, city, address, phone } =
      await req.json();

    const user = await prisma.customer.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Потребителят не е намерен!" },
        { status: 404 }
      );
    }

    const updatedData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      city?: string;
      address?: string;
      phone?: string;
    } = {};

    if (firstName) updatedData.firstName = firstName.trim();
    if (lastName) updatedData.lastName = lastName.trim();
    if (email) updatedData.email = email.trim();
    if (city) updatedData.city = city.trim();
    if (address) updatedData.address = address.trim();
    if (phone) updatedData.phone = phone.trim();

    const updatedUser = await prisma.customer.update({
      where: { id: decoded.userId },
      data: updatedData,
    });

    return NextResponse.json(
      {
        message: "Информацията е успешно обновена!",
        user: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          city: updatedUser.city,
          address: updatedUser.address,
          phone: updatedUser.phone,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Възникна грешка при обновяване на информацията на потребителя:",
      error
    );
    return NextResponse.json(
      { message: "Възникна грешка при обновяване на информацията!" },
      { status: 500 }
    );
  }
}
