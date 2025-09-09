"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/orderService";
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
import CircularProgress from "@/ui/components/circular-progress";
import { OrderItem, OrderResponse } from "@/lib/interfaces";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("userData");
        if (!userData) {
          throw new Error("Не сте влезли в акаунта си!");
        }

        const { token } = JSON.parse(userData);
        const orders = await orderService.getUserOrders(token);
        setOrders(orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Възникна грешка!");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return sortOrder === "asc" ? a.total - b.total : b.total - a.total;
    }
  });

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return {
          text: "Потвърдена",
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bg: "bg-green-500/10 dark:bg-green-500/20",
          textColor: "text-green-600 dark:text-green-400",
        };
      case "pending":
        return {
          text: "Очаква се потвърждение",
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
          textColor: "text-yellow-600 dark:text-yellow-400",
        };
      case "cancelled":
        return {
          text: "Отказана",
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          bg: "bg-red-500/10 dark:bg-red-500/20",
          textColor: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          text: status,
          icon: null,
          bg: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-800 dark:text-gray-200",
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Невалидна дата:", dateString);
        return "Невалидна дата!";
      }
      return format(date, "dd MMMM yyyy, HH:mm", { locale: bg });
    } catch (error) {
      console.error("Възникна грешка при форматиране на датата:", error);
      return "Възникна грешка при форматиране на датата!";
    }
  };

  const toggleSort = (type: "date" | "total") => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900">
        <CircularProgress message="Зареждане на поръчките..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Нямате направени поръчки
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
            Все още не сте направили поръчки в нашия магазин. Разгледайте нашите
            продукти и открийте нещо, което да ви хареса!
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-6 gap-4">
            <button
              onClick={() => toggleSort("date")}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${
                sortBy === "date"
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300"
                  : "text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-300"
              }`}
            >
              <span>Дата</span>
              <div className="flex flex-col -space-y-1.5">
                <ChevronUp
                  className={`w-4 h-4 ${
                    sortBy === "date" && sortOrder === "asc"
                      ? "text-primary dark:text-primary-300"
                      : "text-gray-400"
                  }`}
                />
                <ChevronDown
                  className={`w-4 h-4 ${
                    sortBy === "date" && sortOrder === "desc"
                      ? "text-primary dark:text-primary-300"
                      : "text-gray-400"
                  }`}
                />
              </div>
            </button>
            <button
              onClick={() => toggleSort("total")}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${
                sortBy === "total"
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300"
                  : "text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-300"
              }`}
            >
              <span>Сума</span>
              <div className="flex flex-col -space-y-1.5">
                <ChevronUp
                  className={`w-4 h-4 ${
                    sortBy === "total" && sortOrder === "asc"
                      ? "text-primary dark:text-primary-300"
                      : "text-gray-400"
                  }`}
                />
                <ChevronDown
                  className={`w-4 h-4 ${
                    sortBy === "total" && sortOrder === "desc"
                      ? "text-primary dark:text-primary-300"
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
                        Поръчка #
                      </span>
                      <span className="font-medium ml-1 text-gray-900 dark:text-white">
                        {order.id.substring(0, 8).toUpperCase()}
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

                <div className="p-4">
                  <div className="space-y-4">
                    {order.items.map((item: OrderItem, index: number) => (
                      <div
                        key={`${order.id}-${item.product.id}-${index}`}
                        className="flex gap-4"
                      >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                          {item.product.images &&
                          item.product.images.length > 0 ? (
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
                          <Link
                            href={`/product-catalog/details/${item.product.code}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-300 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} x{" "}
                            {item.price ? item.price.toFixed(2) : "0.00"} лв.
                          </p>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {((item.price || 0) * item.quantity).toFixed(2)} лв.
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col items-end space-y-2">
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
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
