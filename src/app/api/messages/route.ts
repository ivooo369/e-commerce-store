import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch messages from the database
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Error fetching messages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, title, content } = body;

    // Проверка за задължителни полета
    if (!name || !email || !title || !content) {
      return NextResponse.json(
        { error: "Всички полета са задължителни!" },
        { status: 400 }
      );
    }

    // Създаване на ново съобщение
    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        title, // 'title' вместо 'topic'
        content, // 'content' вместо 'message'
      },
    });

    return NextResponse.json(
      { message: "Сообщението е изпратено успешно!", newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Грешка при добавяне на съобщение:", error);
    return NextResponse.json(
      { error: "Грешка при обработка на съобщението." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json(); // Get message ID from request body

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required." },
        { status: 400 }
      );
    }

    // Delete the message from the database
    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Message deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Error deleting the message." },
      { status: 500 }
    );
  }
}
