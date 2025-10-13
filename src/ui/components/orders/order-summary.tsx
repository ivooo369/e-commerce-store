import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils/currency";
import type { OrderItem, OrderSummaryProps } from "@/lib/types/interfaces";

export default function OrderSummary({
  order,
  className = "",
}: OrderSummaryProps) {
  const router = useRouter();

  return (
    <div
      className={`pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
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
            {(order.items as unknown as OrderItem[])?.map((item) => {
              const firstImage =
                Array.isArray(item.product.images) &&
                item.product.images.length > 0 &&
                item.product.images[0];
              return (
                <tr
                  key={`${item.id}-${item.product.code}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 group cursor-pointer"
                  onClick={() =>
                    router.push(`/product-catalog/details/${item.product.code}`)
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
                            alt={item.product.name || "Product image"}
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
                    <span className="ml-0.5 sm:ml-1 text-sm">бр.</span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex flex-col items-end">
                      <span className="font-medium">
                        {item.price?.toFixed(2)} лв.
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatPrice(item.price || 0, "EUR")}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex flex-col items-end">
                      <span>
                        {((item.price || 0) * (item.quantity || 1)).toFixed(2)}{" "}
                        лв.
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatPrice(
                          (item.price || 0) * (item.quantity || 1),
                          "EUR"
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
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
                <div className="flex flex-col items-end">
                  <span className="font-medium">
                    {order.total?.toFixed(2)} лв.
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatPrice(order.total || 0, "EUR")}
                  </span>
                </div>
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
                  <div className="flex flex-col items-end">
                    <span className="font-medium">
                      {order.shippingCost.toFixed(2)} лв.
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatPrice(order.shippingCost, "EUR")}
                    </span>
                  </div>
                </td>
              </tr>
            )}
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                colSpan={3}
                className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm sm:text-base font-bold text-gray-900 dark:text-white"
              >
                <span className="block sm:inline">Крайна сума с доставка:</span>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                <div className="whitespace-nowrap">
                  {((order.total || 0) + (order.shippingCost || 0)).toFixed(2)}{" "}
                  лв. /{" "}
                  {formatPrice(
                    (order.total || 0) + (order.shippingCost || 0),
                    "EUR"
                  )}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
