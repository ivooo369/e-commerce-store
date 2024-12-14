import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error(
      "Възникна грешка при извличане на данните на категориите:",
      error
    );
    return NextResponse.json(
      { error: "Възникна грешка при извличане на данните на категориите!" },
      { status: 500 }
    );
  }
}
