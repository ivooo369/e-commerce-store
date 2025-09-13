import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
