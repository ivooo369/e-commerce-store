import CircularProgress from "@/ui/components/feedback/circular-progress";
import { OrderSuccessContent } from "@/ui/components/orders/order-success-content";
import Box from "@mui/material/Box";
import { Suspense } from "react";

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <Box className="flex justify-center items-center min-h-screen">
          <CircularProgress message="Зареждане..." />
        </Box>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
