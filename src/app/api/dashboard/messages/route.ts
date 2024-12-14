import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error(
      "Възникна грешка при извличане на данните на съобщенията:",
      error
    );
    return NextResponse.json(
      { error: "Възникна грешка при извличане на данните на съобщенията!" },
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
        { error: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        title,
        content,
      },
    });

    return NextResponse.json(
      { message: "Съобщението е изпратено успешно!", newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Грешка при добавяне на съобщение:", error);
    return NextResponse.json(
      { error: "Възникна грешка при обработка на съобщението!" },
      { status: 500 }
    );
  }
}
