"use client";

import { useState, useEffect } from "react";
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
import { OrderResponse, OrderStatus } from "@/lib/interfaces";
import { formatPrice } from "@/lib/currencyUtils";
import OrderStatusModal from "@/ui/components/order-status-modal";
import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/dashboard/dashboard-secondary-nav";
import CircularProgress from "@/ui/components/circular-progress";
import dynamic from "next/dynamic";

const PaginationButtons = dynamic(() => import("@/ui/components/pagination"), {
  ssr: false,
});

type SortField =
  | "id"
  | "createdAt"
  | "total"
  | "customer"
  | "status"
  | "isCompleted";
type SortOrder = "asc" | "desc";

export default function DashboardOrdersPage() {
  const router = useRouter();
  const [allOrders, setAllOrders] = useState<OrderResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    isCompleted: boolean;
  } | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getAllOrders(
          1,
          1000,
          "createdAt",
          "desc",
          "",
          undefined
        );

        setAllOrders(response.orders);
        setFilteredOrders(response.orders);
        setTotalPages(Math.ceil(response.orders.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad) {
      fetchAllOrders();
    }
  }, [isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) {
      let result = [...allOrders];

      if (statusFilter !== "all") {
        result = result.filter((order) => order.status === statusFilter);
      }

      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        result = result.filter((order) => {
          if (order.id.toLowerCase().includes(term)) return true;
          const customerName = order.name || "";
          if (customerName.toLowerCase().includes(term)) return true;
          const customerEmail = order.email || "";
          if (customerEmail.toLowerCase().includes(term)) return true;

          return false;
        });
      }

      result.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "id":
            comparison = a.id.localeCompare(b.id);
            break;
          case "createdAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case "total":
            comparison = (a.total || 0) - (b.total || 0);
            break;
          case "customer":
            const nameA = (a.name || "").toLowerCase();
            const nameB = (b.name || "").toLowerCase();
            comparison = nameA.localeCompare(nameB);
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "isCompleted":
            comparison =
              a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1;
            break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });

      setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
      setCurrentPage((prev) =>
        Math.min(
          prev,
          Math.max(1, Math.ceil(result.length / ITEMS_PER_PAGE)) || 1
        )
      );

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedResult = result.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      );

      setFilteredOrders(paginatedResult);
    }
  }, [
    allOrders,
    searchTerm,
    statusFilter,
    sortBy,
    sortOrder,
    currentPage,
    isInitialLoad,
  ]);

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

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleConfirmStatusChange = async () => {
    if (!selectedOrder) return;

    const { id, isCompleted } = selectedOrder;
    const newStatus = !isCompleted;

    try {
      setAllOrders((prevOrders) =>
        prevOrders.map((order: OrderResponse) =>
          order.id === id ? { ...order, isCompleted: newStatus } : order
        )
      );

      await orderService.updateOrder(id, {
        isCompleted: newStatus,
      });
    } catch (error) {
      console.error("Възникна грешка при актуализиране на поръчката:", error);

      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, isCompleted: isCompleted } : order
        )
      );
    } finally {
      setIsModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleCancelStatusChange = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading && allOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <DashboardSecondaryNav />
        <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[calc(100vh-243.5px)]">
          <CircularProgress message="Зареждане на поръчките..." />
        </div>
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

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Търсене по клиент или № поръчка"
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
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr className="divide-x divide-gray-200 dark:divide-gray-700">
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center justify-center">
                        <span>Дата</span>
                        <div className="flex flex-col ml-1 -space-y-1">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              sortBy === "createdAt" && sortOrder === "asc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${
                              sortBy === "createdAt" && sortOrder === "desc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center justify-center">
                        <span>Поръчка №</span>
                        <div className="flex flex-col ml-1 -space-y-1">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              sortBy === "id" && sortOrder === "asc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${
                              sortBy === "id" && sortOrder === "desc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden sm:table-cell px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("customer")}
                    >
                      <div className="flex items-center justify-center">
                        <span>Клиент</span>
                        <div className="flex flex-col ml-1 -space-y-1">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              sortBy === "customer" && sortOrder === "asc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${
                              sortBy === "customer" && sortOrder === "desc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center justify-center">
                        <span>Статус</span>
                        <div className="flex flex-col ml-1 -space-y-1">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              sortBy === "status" && sortOrder === "asc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${
                              sortBy === "status" && sortOrder === "desc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden sm:table-cell px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("total")}
                    >
                      <div className="flex items-center justify-center">
                        <span>Сума</span>
                        <div className="flex flex-col ml-1 -space-y-1">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              sortBy === "total" && sortOrder === "asc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${
                              sortBy === "total" && sortOrder === "desc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("isCompleted")}
                    >
                      <div className="flex items-center justify-center">
                        <span>Завършена ли е?</span>
                        <div className="flex flex-col ml-1 -space-y-1">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              sortBy === "isCompleted" && sortOrder === "asc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 ${
                              sortBy === "isCompleted" && sortOrder === "desc"
                                ? "text-primary"
                                : "text-gray-300 dark:text-gray-500"
                            }`}
                          />
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order) => {
                    const status = getStatusDisplay(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer divide-x divide-gray-100 dark:divide-gray-700"
                        onClick={() =>
                          router.push(`/dashboard/orders/${order.id}`)
                        }
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-sm text-gray-500 dark:text-gray-300 text-center">
                          <div className="flex flex-col">
                            <span className="sm:hidden text-sm text-gray-400 mb-1">
                              Дата
                            </span>
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
                          <span className="sm:hidden text-sm text-gray-400 block mb-1">
                            Поръчка №
                          </span>
                          #{order.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white text-center">
                            {order.name || "Анонимен клиент"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 text-center truncate max-w-[200px] mx-auto">
                            {order.email || "Без имейл"}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-sm font-medium ${status.bg} ${status.textColor}`}
                            >
                              <span className="hidden sm:inline-block">
                                {status.icon}
                              </span>
                              <span className="ml-0 sm:ml-1">
                                {status.text}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex flex-col items-end">
                            <span>{order.total?.toFixed(2)} лв.</span>
                            <span className="text-xs text-gray-500">
                              {formatPrice(order.total || 0, 'EUR')}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusToggleClick(
                                  order.id,
                                  order.isCompleted
                                );
                              }}
                              className={`p-1 sm:p-1.5 rounded-lg border ${
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
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mx-auto" />
                              ) : (
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 mx-auto" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4 space-y-4 md:space-y-0 mt-4">
          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 rounded-full inline-flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Няма намерени поръчки
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                Не са открити поръчки, отговарящи на зададените критерии.
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 px-2 sm:px-0">
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={allOrders.length}
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
