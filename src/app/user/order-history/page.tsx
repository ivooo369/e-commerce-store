"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import useProtectedRoute from "@/lib/hooks/useProtectedRoute";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Clock,
  XCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import { OrderItem, OrderResponse } from "@/lib/types/interfaces";
import { formatPrice } from "@/lib/utils/currency";
import Box from "@mui/material/Box";

export default function OrderHistoryPage() {
  useProtectedRoute();
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<OrderResponse[]>({
    queryKey: ["userOrders"],
    queryFn: async () => {
      const userData = localStorage.getItem("userData");
      if (!userData) throw new Error("Не сте влезли в акаунта си!");
      const { token } = JSON.parse(userData);
      return await orderService.getUserOrders(token);
    },
    staleTime: 5 * 60 * 1000,
  });

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return sortOrder === "asc" ? a.total - b.total : b.total - a.total;
      }
    });
  }, [orders, sortBy, sortOrder]);

  const toggleSort = (type: "date" | "total") => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return {
          text: "Потвърдена",
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bg: "bg-green-500/10",
          textColor: "text-green-600",
        };
      case "pending":
        return {
          text: "Очаква се потвърждение",
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          bg: "bg-yellow-500/10",
          textColor: "text-yellow-600",
        };
      case "cancelled":
        return {
          text: "Отказана",
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          bg: "bg-red-500/10",
          textColor: "text-red-600",
        };
      default:
        return {
          text: status,
          icon: null,
          bg: "bg-gray-100",
          textColor: "text-gray-800",
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Невалидна дата!"
        : format(date, "dd MMMM yyyy, HH:mm", { locale: bg });
    } catch {
      return "Възникна грешка при форматиране на датата!";
    }
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900">
        <CircularProgress message="Зареждане на поръчките..." />
      </Box>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            Възникна грешка при зареждане на поръчките
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Опитайте отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        История на поръчките
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Нямате направени поръчки
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
            Все още не сте направили поръчки в нашия магазин. Разгледайте нашите
            продукти и открийте нещо, което да Ви хареса!
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-6 gap-4">
            <button
              onClick={() => toggleSort("date")}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${
                sortBy === "date"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              <span>Дата</span>
              <div className="flex flex-col -space-y-1.5">
                <ChevronUp
                  className={`w-4 h-4 ${
                    sortBy === "date" && sortOrder === "asc"
                      ? "text-primary"
                      : "text-gray-400"
                  }`}
                />
                <ChevronDown
                  className={`w-4 h-4 ${
                    sortBy === "date" && sortOrder === "desc"
                      ? "text-primary"
                      : "text-gray-400"
                  }`}
                />
              </div>
            </button>
            <button
              onClick={() => toggleSort("total")}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${
                sortBy === "total"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              <span>Сума</span>
              <div className="flex flex-col -space-y-1.5">
                <ChevronUp
                  className={`w-4 h-4 ${
                    sortBy === "total" && sortOrder === "asc"
                      ? "text-primary"
                      : "text-gray-400"
                  }`}
                />
                <ChevronDown
                  className={`w-4 h-4 ${
                    sortBy === "total" && sortOrder === "desc"
                      ? "text-primary"
                      : "text-gray-400"
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="space-y-6">
            {sortedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Поръчка
                      </span>
                      <span className="font-medium ml-1 text-gray-900 dark:text-white">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">
                      •
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)} ч.
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      getStatusDisplay(order.status).bg
                    } ${getStatusDisplay(order.status).textColor}`}
                  >
                    {getStatusDisplay(order.status).icon}
                    <span>{getStatusDisplay(order.status).text}</span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {order.items.map((item: OrderItem, idx: number) => (
                    <Link
                      key={`${order.id}-${item.product.id}-${idx}`}
                      href={`/product-catalog/details/${item.product.code}`}
                      className="flex gap-4 p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-300 text-xs text-center p-1">
                            Няма снимка
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} x {item.price?.toFixed(2) || "0.00"}{" "}
                          лв.{" "}
                          <span className="text-xs text-gray-400 ml-1">
                            ({formatPrice(item.price || 0, "EUR")})
                          </span>
                        </p>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white text-right">
                        <div>
                          {((item.price || 0) * item.quantity).toFixed(2)} лв.
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPrice(
                            (item.price || 0) * item.quantity,
                            "EUR"
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="p-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col items-end space-y-2">
                  <div className="flex justify-between w-64">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Стойност на продуктите:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-200">
                      {order.productsTotal.toFixed(2)} лв.
                    </span>
                  </div>
                  <div className="flex justify-between w-64">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Доставка:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-200">
                      {order.shippingCost.toFixed(2)} лв.
                    </span>
                  </div>
                  <div className="flex justify-between w-64 pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Общо:
                    </span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {order.total.toFixed(2)} лв.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
