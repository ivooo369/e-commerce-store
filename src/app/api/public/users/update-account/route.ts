import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import jwt from "jsonwebtoken";
import * as Sentry from "@sentry/nextjs";
import type { DecodedToken, UpdateUser } from "@/lib/types/interfaces";

export const dynamic = "force-dynamic";
const JWT_SECRET = process.env.JWT_SECRET;

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
    } catch (error) {
      Sentry.captureException(error);
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
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при обработка на заявката!" },
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
    } catch (error) {
      Sentry.captureException(error);
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

    const updatedData: UpdateUser = {};

    if (email?.trim()) {
      const existingUser = await prisma.customer.findFirst({
        where: {
          email: email.trim(),
          id: { not: decoded.userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Потребител с този имейл вече съществува!" },
          { status: 409 }
        );
      }
      updatedData.email = email.trim();
    }

    if (firstName?.trim()) updatedData.firstName = firstName.trim();
    if (lastName?.trim()) updatedData.lastName = lastName.trim();
    if (city?.trim()) updatedData.city = city.trim();
    if (address?.trim()) updatedData.address = address.trim();
    if (phone?.trim()) updatedData.phone = phone.trim();

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
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при обновяване на информацията!" },
      { status: 500 }
    );
  }
}
