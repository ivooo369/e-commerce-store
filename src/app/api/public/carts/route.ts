import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const sessionId =
    customerId || `anon-${Math.random().toString(36).slice(2, 11)}`;

  try {
    const cartItems = await prisma.cart.findMany({
      where: {
        OR: [
          { customerId: sessionId },
          { customerId: { startsWith: "anon-", equals: sessionId } },
        ],
      },
      include: {
        product: {
          include: {
            subcategories: {
              include: { subcategory: true },
            },
          },
        },
      },
    });
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error(
      "Възникна грешка при извличане на продуктите от количката:",
      error
    );
    return NextResponse.json(
      { message: "Възникна грешка при извличане на продуктите от количката!" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, productCode, quantity = 1 } = body;

    if (!productCode) {
      console.error("Липсва код на продукта:", { productCode });
      return NextResponse.json(
        {
          message: "Липсва код на продукта!",
          details: { productCode: !!productCode },
        },
        { status: 400 }
      );
    }

    const sessionId =
      customerId || `anon-${Math.random().toString(36).slice(2, 11)}`;
    const product = await prisma.product.findUnique({
      where: { code: productCode },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не е намерен! Възможно е да не е в наличност." },
        { status: 404 }
      );
    }

    const existingCartItem = await prisma.cart.findFirst({
      where: {
        customerId: sessionId,
        productId: product.id,
      },
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cart.create({
        data: {
          customerId: sessionId,
          productId: product.id,
          quantity,
        },
      });
    }
    return NextResponse.json({ ...cartItem, sessionId }, { status: 201 });
  } catch (error) {
    console.error(
      "Възникна грешка при добавяне на продукта в количката:",
      error
    );
    return NextResponse.json({ status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { customerId, productIdentifier, quantity } = await request.json();

    if (!customerId || !productIdentifier || quantity === undefined) {
      console.error("Липсват стойности за задължителните полета:", {
        customerId,
        productIdentifier,
        quantity,
      });
      return NextResponse.json(
        {
          message: "Липсват задължителни полета!",
          details: {
            customerId: !!customerId,
            productIdentifier: !!productIdentifier,
            quantity: quantity !== undefined,
          },
        },
        { status: 400 }
      );
    }

    let product = await prisma.product.findUnique({
      where: { id: productIdentifier },
    });

    if (!product) {
      product = await prisma.product.findUnique({
        where: { code: productIdentifier },
      });
    }

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не е намерен! Възможно е да не е в наличност." },
        { status: 404 }
      );
    }

    const cartItem = await prisma.cart.findFirst({
      where: { customerId, productId: product.id },
    });

    if (!cartItem) {
      return NextResponse.json(
        { message: "Артикулът не е намерен в количката!" },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      await prisma.cart.delete({ where: { id: cartItem.id } });
      return NextResponse.json({
        message: "Артикулът беше премахнат от количката!",
      });
    }

    const updatedItem = await prisma.cart.update({
      where: { id: cartItem.id },
      data: { quantity },
      include: { product: true },
    });
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Възникна грешка при обновяване на количеството:", error);
    return NextResponse.json(
      {
        message: "Възникна грешка при обновяване на количеството!",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { customerId, productIdentifier, clearAll } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        {
          message: "Липсва ID на потребителя!",
          details: { customerId: false },
        },
        { status: 400 }
      );
    }

    if (clearAll) {
      await prisma.cart.deleteMany({ where: { customerId } });
      return NextResponse.json({
        message: "Количката беше изчистена успешно!",
      });
    } else {
      if (!productIdentifier) {
        return NextResponse.json(
          { message: "Липсва идентификатор на продукт!" },
          { status: 400 }
        );
      }

      let product = await prisma.product.findUnique({
        where: { id: productIdentifier },
      });

      if (!product) {
        product = await prisma.product.findUnique({
          where: { code: productIdentifier },
        });
      }

      if (!product) {
        return NextResponse.json(
          {
            message: "Продуктът не е намерен! Възможно е да не е в наличност.",
          },
          { status: 404 }
        );
      }

      const cartItem = await prisma.cart.findFirst({
        where: { customerId, productId: product.id },
      });

      if (cartItem) {
        await prisma.cart.delete({ where: { id: cartItem.id } });
      }

      return NextResponse.json({
        message: "Продуктът беше премахнат от количката!",
      });
    }
  } catch (error) {
    console.error(
      "Възникна грешка при обработка на заявката за количка:",
      error
    );
    return NextResponse.json(
      {
        message: "Възникна грешка при обработка на заявката за количка!",
      },
      { status: 500 }
    );
  }
}
