import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на категориите!" },
      { status: 500 }
    );
  }
}
