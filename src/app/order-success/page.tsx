"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Home, Mail, Phone } from "lucide-react";
import CircularProgress from "@/ui/components/circular-progress";
import { getDeliveryMethod } from "@/lib/delivery";
import { Order } from "@prisma/client";
import { orderService } from "@/services/orderService";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const orderData = await orderService.getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Възникна грешка при извличане на данните за поръчката!"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <CircularProgress message="Зареждане на данните за поръчката..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Грешка
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-blue-600 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Към началната страница
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Order Confirmation Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-8 sm:px-10 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-3">
              Благодарим Ви за поръчката!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Вашата поръчка е приета успешно и се обработва.
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Номер на поръчка:{" "}
                <span className="font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  #{orderId.substring(0, 8)}
                </span>
              </p>
            )}
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 sm:px-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Детайли за поръчката
              </h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Статус
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />В обработка
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Дата на поръчка
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {currentTime.toLocaleDateString("bg-BG", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}{" "}
                      ч.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 10h18M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Начин на плащане
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      Наложен платеж
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Начин на доставка
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {(() => {
                        const deliveryMethod = getDeliveryMethod(
                          order?.address || ""
                        );
                        switch (deliveryMethod) {
                          case "SPEEDY":
                            return "Спиди";
                          case "ECONT":
                            return "Еконт";
                          case "ADDRESS":
                          default:
                            return "До адрес";
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                  Какво следва?
                </h3>
                <div className="mt-3 text-blue-700 dark:text-blue-200">
                  <p className="mb-3">
                    Ще получите потвърждение на посочения имейл адрес с всички
                    детайли за поръчката. Ако не виждате имейла, моля проверете
                    и спам папката.
                  </p>
                  <p className="font-medium mb-2">
                    Ако имате въпроси относно поръчката си, не се колебайте да
                    се свържете с нас:
                  </p>
                  <ul className="space-y-2 mt-3">
                    <li className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <a href="tel:+359889115233" className="hover:underline">
                        +359 88 911 5233
                      </a>
                    </li>
                    <li className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <a
                        href="mailto:lipcidesignstudio@gmail.com"
                        className="hover:underline"
                      >
                        lipcidesignstudio@gmail.com
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress message="Зареждане..." />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
