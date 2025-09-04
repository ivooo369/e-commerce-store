"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { orderService } from "@/services/orderService";
import CircularProgress from "@/ui/components/circular-progress";

function CancelContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const cancelOrder = async () => {
      if (!orderId) return;

      try {
        const data = await orderService.cancelOrder(orderId);

        if (data.status === "cancelled") {
          setStatus("success");
        } else if (data.status === "confirmed") {
          window.location.href = `/orders/status?orderId=${orderId}&status=confirmed`;
          return;
        } else {
          window.location.href = `/orders/status?orderId=${orderId}&status=invalid`;
          return;
        }
      } catch (error) {
        console.error("Възникна грешка при отказване на поръчката:", error);
        setError(
          "Неуспешно отказване на поръчката. Моля, опитайте отново по-късно!"
        );
        setStatus("error");
      }
    };

    if (orderId) {
      cancelOrder();
    } else {
      window.location.href = "/";
    }
  }, [orderId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center justify-center py-8 space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-lg">Отказване на поръчката...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              Грешка
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {error ||
                "Възникна грешка при отказване на поръчката. Моля, опитайте отново по-късно!"}
            </p>
            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
              >
                Обратно към началната страница
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            Поръчката е отказана
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Вашата поръчка беше успешно отказана! Ако имате въпроси, не се
            колебайте да се свържете с нас.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress message="Зареждане..." />
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
