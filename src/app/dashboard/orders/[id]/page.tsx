"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { orderService } from "@/services/orderService";
import { OrderResponse } from "@/lib/types/interfaces";
import DashboardNav from "@/ui/components/layouts/dashboard-primary-nav";
import DashboardSecondaryNav from "@/ui/components/layouts/dashboard-secondary-nav";
import OrderNotesModal from "@/ui/components/modals/order-notes-modal";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import { useQuery } from "@tanstack/react-query";
import OrderDetails from "../../../../ui/components/orders/order-details";
import OrderSummary from "../../../../ui/components/orders/order-summary";
import Box from "@mui/material/Box";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const {
    data: order,
    isLoading,
    error: queryError,
  } = useQuery<OrderResponse>({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderById(id as string),
    enabled: !!id,
  });

  const error = queryError
    ? "Възникна грешка при извличане на данните за поръчката!"
    : null;

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />
        <DashboardSecondaryNav />
        <Box className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[calc(100vh-243.5px)]">
          <CircularProgress message="Зареждане на данните за поръчката..." />
        </Box>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        <div className="space-y-6">
          <OrderDetails
            order={order}
            onOpenNotes={() => setIsNotesModalOpen(true)}
          />
          <OrderSummary order={order} />
          <OrderNotesModal
            open={isNotesModalOpen}
            onClose={() => setIsNotesModalOpen(false)}
            notes={order.additionalInfo}
          />
        </div>
      </div>
    </div>
  );
}
