import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import nodemailer from "nodemailer";
import { contactEmailHtml } from "@/lib/email-templates/contactEmail";

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
    const body = await request.json();
    let { name, email, title, content } = body;

    name = name?.trim();
    email = email?.trim();
    title = title?.trim();
    content = content?.trim();

    if (!name || !email || !title || !content) {
      return NextResponse.json(
        { message: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { message: "Името не може да надвишава 100 символа!" },
        { status: 400 }
      );
    }

    if (email.length > 255) {
      return NextResponse.json(
        { message: "Имейлът не може да надвишава 255 символа!" },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { message: "Темата не може да надвишава 100 символа!" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { message: "Съобщението не може да надвишава 500 символа!" },
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

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        title,
        content,
        customerId: existingCustomer ? existingCustomer.id : null,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: title,
      text: content,
      html: contactEmailHtml({ name, email, title, content }),
    });

    return NextResponse.json(
      { message: "Съобщението е изпратено успешно!", newMessage },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Възникна грешка при обработка на съобщението!" },
      { status: 500 }
    );
  }
}
