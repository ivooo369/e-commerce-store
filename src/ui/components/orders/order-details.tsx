import {
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Truck,
  Package,
  ChevronRight,
} from "lucide-react";
import { OrderDetailsProps } from "@/lib/types/interfaces";
import { formatPrice } from "@/lib/utils/currency";
import { getDeliveryMethod, SHIPPING_COSTS } from "@/lib/utils/delivery";

export default function OrderDetails({
  order,
  onOpenNotes,
}: OrderDetailsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6">
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

          <div className="w-full sm:w-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
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

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700">
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

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
              Адрес за доставка
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Населено място
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

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700">
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
                        <p className="text-sm text-gray-500">
                          {SHIPPING_COSTS.ADDRESS.toFixed(2)} лв. /{" "}
                          {formatPrice(SHIPPING_COSTS.ADDRESS, "EUR")}
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
                        <p className="text-sm text-gray-500">
                          {SHIPPING_COSTS.SPEEDY.toFixed(2)} лв. /{" "}
                          {formatPrice(SHIPPING_COSTS.SPEEDY, "EUR")}
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
                        <p className="text-sm text-gray-500">
                          {SHIPPING_COSTS.ECONT.toFixed(2)} лв. /{" "}
                          {formatPrice(SHIPPING_COSTS.ECONT, "EUR")}
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
                        onOpenNotes();
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
