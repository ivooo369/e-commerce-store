import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Възникна грешка при извличане на съобщенията:", error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на съобщенията!" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, title, content } = body;

    if (!name || !email || !title || !content) {
      return NextResponse.json(
        { message: "Всички полета са задължителни!" },
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
      from: `"${name}" <lipcidesignstudio@gmail.com>`,
      to: "lipcidesignstudio@gmail.com",
      replyTo: email,
      subject: `${title}`,
      text: content,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 800px; overflow: hidden;">
          <header style="background-color: #1E3A8A; color: #ffffff; padding: 0.6rem; text-align: center;">
            <h1 class="header-text" style="margin: 0; font-size: 1.2rem;">
              Ново съобщение от контактната форма
            </h1>
          </header>
          <div class="content" style="font-size: 1rem; padding: 1rem 1.5rem 1rem 1.5rem; background-color: #f8fafc;">
            <section style="margin-bottom: 1rem;">
              <strong class="label" style="margin-right: 5px; color: #1f2937;">Име:</strong>
              <span class="value" style="color: #4b5563; display: block;">${name}</span>
            </section>
            <section style="margin-bottom: 1rem;">
              <strong class="label" style="margin-right: 5px; color: #1f2937;">Email:</strong>
              <span class="value" style="color: #4b5563; display: block;">${email}</span>
            </section>
            <section style="margin-bottom: 1rem;">
              <strong class="label" style="margin-right: 5px; color: #1f2937;">Тема:</strong>
              <span class="value" style="color: #4b5563; display: block;">${title}</span>
            </section>
            <section>
              <strong class="label" style="margin-right: 5px; color: #1f2937;">Съобщение:</strong>
              <span class="value" style="color: #4b5563; display: block;">${content}</span>
            </section>
          </div>
          <footer style="background-color: #1E3A8A; color: #ffffff; padding: 0.5rem; font-size: 0.9rem; text-align: center;">
            <p class="footer-text" style="margin: 0;">
              Това съобщение е изпратено чрез контактната форма на сайта.
            </p>
          </footer>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Съобщението е изпратено успешно!", newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Възникна грешка при обработка на съобщението:", error);
    return NextResponse.json(
      { message: "Възникна грешка при обработка на съобщението!" },
      { status: 500 }
    );
  }
}
