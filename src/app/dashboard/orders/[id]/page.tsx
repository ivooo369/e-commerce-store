"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { orderService } from "@/services/orderService";
import { OrderResponse, OrderItem } from "@/lib/interfaces";
import { getDeliveryMethod, SHIPPING_COSTS } from "@/lib/delivery";
import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/dashboard/dashboard-secondary-nav";
import OrderNotesModal from "@/ui/components/order-notes-modal";
import {
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Truck,
  Package,
  ChevronRight,
} from "lucide-react";
import CircularProgress from "@/ui/components/circular-progress";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(id as string);
        setOrder(data);
      } catch (err) {
        console.error(
          "Възникна грешка при извличане на данните за поръчката:",
          err
        );
        setError("Възникна грешка при извличане на данните за поръчката!");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <DashboardSecondaryNav />
        <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[calc(100vh-243.5px)]">
          <CircularProgress message="Зареждане на данните за поръчката..." />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <DashboardSecondaryNav />
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
              Грешка при зареждане на поръчката
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error || "Поръчката не беше намерена!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl">
        <div className="overflow-hidden">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Поръчка #{order.id?.substring(0, 8).toUpperCase()}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      {new Intl.DateTimeFormat("bg-BG", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      }).format(new Date(order.createdAt))}{" "}
                      ч.
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          order.isCompleted
                            ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800"
                        }`}
                      >
                        {order.isCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span>Завършена</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Незавършена</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 sm:mb-6">
                    <h4 className="font-medium text-gray-500 dark:text-gray-400 text-sm mb-2">
                      Статус на поръчката
                    </h4>
                    <div className="flex items-center">
                      {order.status === "pending" && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                          <Clock className="w-4 h-4 mr-2" />
                          Изчаква потвърждение
                        </span>
                      )}
                      {order.status === "confirmed" && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Потвърдена
                        </span>
                      )}
                      {order.status === "cancelled" && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
                          <XCircle className="w-4 h-4 mr-2" />
                          Отказана
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white dark:bg-gray-700 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                      Информация за клиента
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Име
                        </p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {order.name || "Не е посочено"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Телефон
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {order.phone || "Не е посочен"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Имейл
                        </p>
                        <p className="text-gray-900 dark:text-white break-all">
                          {order.email || "Не е посочен"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                      Адрес за доставка
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Град
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {order.city || "Не е посочен"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Адрес
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {order.address || "Не е посочен"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                      Начин на доставка
                    </h3>
                    <div className="space-y-4">
                      {order.address ? (
                        <div>
                          {getDeliveryMethod(order.address) === "ADDRESS" && (
                            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  До адрес
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {SHIPPING_COSTS.ADDRESS.toFixed(2)} лв.
                                </p>
                              </div>
                            </div>
                          )}
                          {getDeliveryMethod(order.address) === "SPEEDY" && (
                            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50">
                              <Truck className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  До офис на Спиди
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {SHIPPING_COSTS.SPEEDY.toFixed(2)} лв.
                                </p>
                              </div>
                            </div>
                          )}
                          {getDeliveryMethod(order.address) === "ECONT" && (
                            <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800/50">
                              <Package className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  До офис на Еконт
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {SHIPPING_COSTS.ECONT.toFixed(2)} лв.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          Не е избран начин на доставка
                        </p>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Бележки към поръчката
                        </p>
                        {order.additionalInfo?.trim() ? (
                          <div className="mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsNotesModalOpen(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-200 dark:border-blue-800 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                            >
                              Виж бележки
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm py-1.5">
                            Няма бележки към поръчката
                          </p>
                        )}
                      </div>

                      <OrderNotesModal
                        open={isNotesModalOpen}
                        onClose={() => setIsNotesModalOpen(false)}
                        notes={order.additionalInfo}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Продукти в поръчката
                  </h3>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Продукт
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Количество
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                            Единична цена
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Общо
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {(order.items as unknown as OrderItem[])?.map(
                          (item) => {
                            const firstImage =
                              Array.isArray(item.product.images) &&
                              item.product.images.length > 0 &&
                              item.product.images[0];
                            return (
                              <tr
                                key={`${item.id}-${item.product.code}`}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700 group cursor-pointer"
                                onClick={() =>
                                  router.push(
                                    `/product-catalog/details/${item.product.code}`
                                  )
                                }
                              >
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                  <div className="flex items-center group-hover:translate-x-1 transition-transform">
                                    {firstImage ? (
                                      <div className="flex-shrink-0 h-14 w-14 sm:h-20 sm:w-20 mr-2 sm:mr-4 bg-white rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 relative">
                                        <Image
                                          fill
                                          className="object-cover"
                                          src={firstImage}
                                          alt={
                                            item.product.name || "Product image"
                                          }
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              "/images/placeholder-product.png";
                                          }}
                                          sizes="(max-width: 768px) 3.5rem, 5rem"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 h-14 w-14 sm:h-20 sm:w-20 mr-2 sm:mr-4 bg-gray-100 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                        <svg
                                          className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 dark:text-gray-400"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                        {item.product.name}
                                      </div>
                                      {item.product.code && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                          Код: {item.product.code}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300">
                                  <span className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 border border-gray-200 dark:border-gray-600 rounded-md">
                                    {item.quantity}
                                  </span>
                                  <span className="ml-0.5 sm:ml-1 text-sm">
                                    бр.
                                  </span>
                                </td>
                                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">
                                  {item.price?.toFixed(2)} лв.
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                                  {(
                                    (item.price || 0) * (item.quantity || 1)
                                  ).toFixed(2)}{" "}
                                  лв.
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 sm:px-6 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-300"
                          >
                            Продукти:
                          </td>
                          <td className="px-3 sm:px-6 py-2 text-right text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {order.total?.toFixed(2)} лв.
                          </td>
                        </tr>
                        {order.shippingCost && order.shippingCost > 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-3 sm:px-6 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-300"
                            >
                              Доставка:
                            </td>
                            <td className="px-3 sm:px-6 py-2 text-right text-sm text-gray-900 dark:text-white whitespace-nowrap">
                              {order.shippingCost.toFixed(2)} лв.
                            </td>
                          </tr>
                        )}
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td
                            colSpan={3}
                            className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm sm:text-base font-bold text-gray-900 dark:text-white"
                          >
                            <span className="block sm:inline">
                              Крайна сума с доставка:
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                            {(
                              (order.total || 0) + (order.shippingCost || 0)
                            ).toFixed(2)}{" "}
                            лв.
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
