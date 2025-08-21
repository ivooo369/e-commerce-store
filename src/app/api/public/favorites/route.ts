import { NextResponse } from "next/server";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favoritesService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json(
      { message: "Не е предоставен ID на потребителя!" },
      { status: 400 }
    );
  }

  try {
    const favoriteProducts = await getFavorites(customerId);
    return NextResponse.json(favoriteProducts, { status: 200 });
  } catch (error) {
    console.error("Възникна грешка при извличане на любимите продукти:", error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на любимите продукти!" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, productId } = body;

    if (!customerId || !productId) {
      return NextResponse.json(
        { message: "Липсват задължителни данни!" },
        { status: 400 }
      );
    }

    await addFavorite(customerId, productId);

    return NextResponse.json(
      { message: "Продуктът беше добавен успешно в 'Любими'!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Възникна грешка при добавяне в 'Любими':", error);

    return NextResponse.json(
      { message: "Възникна грешка при добавяне в 'Любими'!" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { customerId, productId } = body;

    if (!customerId || !productId) {
      return NextResponse.json(
        { message: "Липсват задължителни данни!" },
        { status: 400 }
      );
    }

    await removeFavorite(customerId, productId);

    return NextResponse.json(
      { message: "Продуктът беше премахнат успешно от 'Любими'!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Възникна грешка при премахване от 'Любими':", error);

    return NextResponse.json(
      { message: "Възникна грешка при премахване от 'Любими'!" },
      { status: 500 }
    );
  }
}
