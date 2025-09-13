import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Възникна грешка при извличане на категориите:", error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на категориите!" },
      { status: 500 }
    );
  }
}
