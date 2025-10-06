import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на съобщенията!" },
      { status: 500 }
    );
  }
}
