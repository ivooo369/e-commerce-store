import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
        { error: "Потребител с този имейл вече съществува!" },
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
        { error: "JWT_SECRET не е дефиниран!" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verificationLink = `http://localhost:3000/user/verify-email?token=${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
          <header style="background-color: #1E3A8A; color: #ffffff; padding: 0.6rem; text-align: center;">
            <h2 class="header-text" style="margin: 0; font-size: 1.5rem;">
              Потвърдете Вашия имейл адрес
            </h2>
          </header>
          <div class="content" style="font-size: 1.2rem; font-weight: bold; text-align: center; padding: 1rem 1.5rem 1rem 1.5rem; background-color: #f8fafc;">
            <p style="color: #4b5563; margin-bottom: 1rem;">
              Моля, потвърдете имейла си, като натиснете следния линк:
            </p>
            <p style="text-align: center;">
              <a href="${verificationLink}" style="background-color: #1E3A8A; color: #ffffff; padding: 0.8rem 2rem; text-decoration: none; font-size: 1.1rem; border-radius: 5px; display: inline-block;">
                Потвърдете имейла
              </a>
            </p>
            <p style="color: #4b5563; margin-top: 1rem;">
              Линкът ще бъде валиден за 1 час. Ако не сте поискали регистрацията, просто игнорирайте това съобщение.
            </p>
          </div>
          <footer style="background-color: #1E3A8A; color: #ffffff; padding: 0.5rem; font-size: 0.9rem; text-align: center;">
            <p class="footer-text" style="margin: 0;">
              Това съобщение е изпратено автоматично. Моля, не отговаряйте на него.
            </p>
          </footer>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message:
          "Вашата регистрация е успешна! Моля, отворете имейла си и кликнете върху изпратения линк, за да верифицирате акаунта си!",
        token,
        user: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
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
