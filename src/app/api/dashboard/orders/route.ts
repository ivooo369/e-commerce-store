import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { calculateShippingCost, getDeliveryMethod } from "@/lib/utils/delivery";
import prisma from "@/lib/services/prisma";
import * as Sentry from "@sentry/nextjs";
import type { OrderItem } from "@/lib/types/interfaces";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc" | null) || "desc";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: Prisma.OrderWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const total = await prisma.order.count({ where });
    const totalPages = Math.ceil(total / limit);

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: sortOrder as Prisma.SortOrder,
      },
      skip,
      take: limit,
    });

    const formattedOrders = orders.map((order) => {
      const items = order.items as unknown as OrderItem[];

      const productsTotal = items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
      const deliveryMethod = order.address
        ? getDeliveryMethod(order.address)
        : "ADDRESS";
      const shippingCost = calculateShippingCost(deliveryMethod);
      const total = productsTotal + shippingCost;
      const customerName = order.customer
        ? `${order.customer.firstName || ""} ${
            order.customer.lastName || ""
          }`.trim()
        : order.name || "";
      return {
        ...order,
        items,
        productsTotal,
        shippingCost,
        total,
        customerName,
        user: order.customer
          ? {
              id: order.customer.id,
              name: customerName,
              email: order.customer.email || "",
            }
          : null,
      };
    });

    if (sortBy) {
      formattedOrders.sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];
        if (aValue == null) return sortOrder === "asc" ? -1 : 1;
        if (bValue == null) return sortOrder === "asc" ? 1 : -1;
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    } else if (sortBy === "customer") {
      formattedOrders.sort((a, b) => {
        const nameA = a.customerName.toLowerCase();
        const nameB = b.customerName.toLowerCase();
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    } else if (sortBy === "productsTotal") {
      formattedOrders.sort((a, b) => {
        return sortOrder === "asc"
          ? a.productsTotal - b.productsTotal
          : b.productsTotal - a.productsTotal;
      });
    } else if (sortBy === "status") {
      formattedOrders.sort((a, b) => {
        const statusA = a.status.toLowerCase();
        const statusB = b.status.toLowerCase();
        return sortOrder === "asc"
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA);
      });
    }

    return NextResponse.json({
      orders: formattedOrders,
      total,
      page,
      totalPages,
      limit,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Възникна грешка при извличане на поръчките!" },
      { status: 500 }
    );
  }
}
