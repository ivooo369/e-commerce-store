import { redirect } from "next/navigation";
import { orderService } from "@/services/orderService";
import type { OrderStatusPageProps } from "@/lib/types/interfaces";

export default async function OrderStatusPage({
  searchParams,
}: OrderStatusPageProps) {
  const { orderId, status: statusParam } = searchParams;

  if (!orderId) {
    redirect("/");
  }

  try {
    const orderData = await orderService.getOrderStatus(orderId);
    const status = statusParam || orderData.status;

    const formatOrderDate = (dateString: string | Date) => {
      try {
        const date =
          dateString instanceof Date ? dateString : new Date(dateString);
        if (isNaN(date.getTime())) {
          return "Датата не е налична";
        }
        return date.toLocaleString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "Датата не е налична";
      }
    };

    const orderDate = formatOrderDate(orderData.createdAt);

    switch (status) {
      case "confirmed":
        return renderSuccessPage(orderId, orderDate);
      case "cancelled":
        return renderCancelledPage(orderId, orderDate);
      case "pending":
        return renderPendingPage(orderId, orderDate);
      default:
        return renderErrorPage("Невалиден статус на поръчката!");
    }
  } catch {
    return renderErrorPage(
      "Възникна грешка при проверка на статуса на поръчката!"
    );
  }
}

function renderSuccessPage(orderId: string, orderDate: string) {
  return (
    <div className="flex items-center min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <svg
              className="h-10 w-10 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Поръчката вече е потвърдена!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            Номер на поръчка:{" "}
            <span className="font-medium dark:text-white">
              #{orderId.substring(0, 8).toUpperCase()}
            </span>
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Дата на поръчка:{" "}
            <span className="font-medium dark:text-white">{orderDate} ч.</span>
          </p>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Вашата поръчка вече е потвърдена. За да направите промени или да я
              откажете, моля, свържете се с нас чрез някой от посочените начини
              за контакт и ние ще сторим нужното:
            </p>

            <div className="flex flex-col space-y-3">
              <a
                href="tel:+359889115233"
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                +359 88 911 5233
              </a>

              <a
                href={`mailto:${process.env.EMAIL_USER}`}
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {process.env.EMAIL_USER}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCancelledPage(orderId: string, orderDate: string) {
  return (
    <div className="flex items-center min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg
              className="h-10 w-10 text-red-600 dark:text-red-400"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Поръчката вече е отказана!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            Номер на поръчка:{" "}
            <span className="font-medium dark:text-white">
              #{orderId.substring(0, 8).toUpperCase()}
            </span>
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Дата на поръчка:{" "}
            <span className="font-medium dark:text-white">{orderDate} ч.</span>
          </p>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Вашата поръчка вече е отказана. Ако сте я отказали по погрешка,
              моля, направете нова поръчка или се свържете се с нас чрез някой
              от посочените начини за контакт и ние ще я възстановим:
            </p>
            <div className="flex flex-col space-y-3">
              <a
                href="tel:+359889115233"
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                +359 88 911 5233
              </a>

              <a
                href={`mailto:${process.env.EMAIL_USER}`}
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {process.env.EMAIL_USER}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderPendingPage(orderId: string, orderDate: string) {
  return (
    <div className="flex items-center min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <svg
              className="h-10 w-10 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Изчаква потвърждение
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            Номер на поръчка:{" "}
            <span className="font-medium dark:text-white">
              #{orderId.substring(0, 8).toUpperCase()}
            </span>
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Дата на поръчка:{" "}
            <span className="font-medium dark:text-white">{orderDate} ч.</span>
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Вашата поръчка изчаква потвърждение. Моля, проверете вашата
            електронна поща за линк за потвърждение.
          </p>
        </div>
      </div>
    </div>
  );
}

function renderErrorPage(message: string) {
  return (
    <div className="flex items-center min-h-[calc(100vh-243.5px)] bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg
              className="h-10 w-10 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Грешка
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        </div>
      </div>
    </div>
  );
}
