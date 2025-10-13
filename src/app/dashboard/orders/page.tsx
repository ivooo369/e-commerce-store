"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { orderService } from "@/services/orderService";
import {
  Search,
  Clock,
  Check,
  ChevronUp,
  ChevronDown,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils/currency";
import OrderStatusModal from "@/ui/components/modals/order-status-modal";
import DashboardNav from "@/ui/components/layouts/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/components/layouts/dashboard-secondary-nav";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import Box from "@mui/material/Box";
import type { SortField, SortOrder } from "@/lib/types/types";
import type { OrderResponse, OrderStatus } from "@/lib/types/interfaces";

const PaginationButtons = dynamic(
  () => import("@/ui/components/navigation/pagination"),
  { ssr: false }
);

export default function DashboardOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    isCompleted: boolean;
  } | null>(null);

  const ITEMS_PER_PAGE = 10;
  const [debouncedSearch] = useDebounce(searchTerm, 250);

  const { data: allOrders = [], isLoading } = useQuery<OrderResponse[]>({
    queryKey: ["orders"],
    queryFn: () =>
      orderService
        .getAllOrders(1, 1000, "createdAt", "desc", "", undefined)
        .then((res) => res.orders),
    staleTime: 5 * 60 * 1000,
  });

  const filteredOrders = useMemo(() => {
    let result = [...allOrders];

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (debouncedSearch.trim() !== "") {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().startsWith(term) ||
          (o.name?.toLowerCase().includes(term) ?? false) ||
          (o.email?.toLowerCase().includes(term) ?? false)
      );
    }

    result.sort((a, b) => {
      let comp = 0;
      switch (sortBy) {
        case "id":
          comp = a.id.localeCompare(b.id);
          break;
        case "createdAt":
          comp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "total":
          comp = (a.total || 0) - (b.total || 0);
          break;
        case "customer":
          comp = (a.name ?? "").localeCompare(b.name ?? "");
          break;
        case "status":
          comp = a.status.localeCompare(b.status);
          break;
        case "isCompleted":
          comp = a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1;
          break;
      }
      return sortOrder === "asc" ? comp : -comp;
    });

    return result;
  }, [allOrders, debouncedSearch, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      orderService.updateOrder(id, { isCompleted }),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const previousOrders = queryClient.getQueryData<OrderResponse[]>([
        "orders",
      ]);
      queryClient.setQueryData<OrderResponse[]>(["orders"], (old = []) =>
        old.map((o) => (o.id === id ? { ...o, isCompleted } : o))
      );
      return { previousOrders };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusToggleClick = (orderId: string, currentStatus: boolean) => {
    setSelectedOrder({ id: orderId, isCompleted: currentStatus });
    setIsModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!selectedOrder) return;
    updateOrderStatus({
      id: selectedOrder.id,
      isCompleted: !selectedOrder.isCompleted,
    });
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelStatusChange = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusDisplay = (status: string): OrderStatus => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return {
          text: "Потвърдена",
          icon: <CheckCircle className="w-4 h-4" />,
          bg: "bg-green-100 dark:bg-green-900",
          textColor: "text-green-800 dark:text-green-200",
        };
      case "cancelled":
        return {
          text: "Отказана",
          icon: <XCircle className="w-4 h-4" />,
          bg: "bg-red-100 dark:bg-red-900",
          textColor: "text-red-800 dark:text-red-200",
        };
      default:
        return {
          text: "Изчаква потвърждение",
          icon: <Clock className="w-4 h-4" />,
          bg: "bg-yellow-100 dark:bg-yellow-900",
          textColor: "text-yellow-800 dark:text-yellow-200",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("bg-BG", options);
  };

  if (isLoading && allOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <DashboardSecondaryNav />
        <Box className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[calc(100vh-243.5px)]">
          <CircularProgress message="Зареждане на поръчките..." />
        </Box>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="container mx-auto px-2 sm:px-4 py-6 max-w-7xl">
        <div className="flex flex-col space-y-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Всички поръчки
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Управление на всички поръчки в системата
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Търсене по име, имейл или начало на № поръчка"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm sm:text-base"
            >
              <option value="all">Всички статуси</option>
              <option value="confirmed">Потвърдени</option>
              <option value="cancelled">Отказани</option>
              <option value="pending">Изчакват потвърждение</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr className="divide-x divide-gray-200 dark:divide-gray-700">
                    {[
                      "createdAt",
                      "id",
                      "customer",
                      "status",
                      "total",
                      "isCompleted",
                    ].map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className={`${
                          col === "isCompleted" ? "w-48 px-4" : "px-3 sm:px-6"
                        } py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer`}
                        onClick={() => handleSort(col as SortField)}
                      >
                        <div className="flex items-center justify-center">
                          <span>
                            {col === "createdAt"
                              ? "Дата"
                              : col === "id"
                              ? "Поръчка №"
                              : col === "customer"
                              ? "Клиент"
                              : col === "status"
                              ? "Статус"
                              : col === "total"
                              ? "Сума"
                              : "Завършена ли е?"}
                          </span>
                          <div className="flex flex-col ml-1 -space-y-1">
                            <ChevronUp
                              className={`w-3 h-3 ${
                                sortBy === col && sortOrder === "asc"
                                  ? "text-primary"
                                  : "text-gray-300 dark:text-gray-500"
                              }`}
                            />
                            <ChevronDown
                              className={`w-3 h-3 ${
                                sortBy === col && sortOrder === "desc"
                                  ? "text-primary"
                                  : "text-gray-300 dark:text-gray-500"
                              }`}
                            />
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedOrders.map((order) => {
                    const status = getStatusDisplay(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer divide-x divide-gray-100 dark:divide-gray-700"
                        onClick={() =>
                          router.push(`/dashboard/orders/${order.id}`)
                        }
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          <div className="flex flex-col">
                            <span>
                              {formatDate(order.createdAt).split(",")[0]}
                            </span>
                            <span className="text-sm text-gray-400">
                              {formatDate(order.createdAt).split(",")[1].trim()}{" "}
                              ч.
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-center">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-center">
                          <div>{order.name || "Анонимен клиент"}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] mx-auto">
                            {order.email || "Без имейл"}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-sm font-medium ${status.bg} ${status.textColor}`}
                          >
                            <span className="hidden sm:inline-block">
                              {status.icon}
                            </span>
                            <span className="ml-0 sm:ml-1">{status.text}</span>
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex flex-col items-end">
                            <span>{order.total?.toFixed(2)} лв.</span>
                            <span className="text-xs text-gray-500">
                              {formatPrice(order.total || 0, "EUR")}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusToggleClick(
                                order.id,
                                order.isCompleted
                              );
                            }}
                            className={`mx-auto p-1 sm:p-1.5 rounded-lg border ${
                              order.isCompleted
                                ? "border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50"
                                : "border-yellow-100 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                            } transition-colors w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center`}
                            title={
                              order.isCompleted
                                ? "Маркирай като незавършена"
                                : "Маркирай като завършена"
                            }
                          >
                            {order.isCompleted ? (
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 px-2 sm:px-0">
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredOrders.length}
              paginate={setCurrentPage}
              currentPage={currentPage}
              className="mt-4"
            />
          </div>
        )}
      </div>

      <OrderStatusModal
        open={isModalOpen}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        isCompleted={selectedOrder?.isCompleted || false}
        orderId={selectedOrder?.id}
      />
    </div>
  );
}
