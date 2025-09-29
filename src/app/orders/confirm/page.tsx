import { Suspense } from "react";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import OrderConfirmContent from "@/ui/components/orders/confirm-order-content";
import Box from "@mui/material/Box";

export default function ConfirmOrderPage() {
  return (
    <Suspense
      fallback={
        <Box className="flex justify-center items-center min-h-screen">
          <CircularProgress message="Зареждане..." />
        </Box>
      }
    >
      <OrderConfirmContent />
    </Suspense>
  );
}
