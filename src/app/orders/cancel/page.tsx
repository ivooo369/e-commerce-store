import { Suspense } from "react";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import CancelOrderContent from "@/ui/components/orders/cancel-order-content";
import Box from "@mui/material/Box";

export default function CancelOrderPage() {
  return (
    <Suspense
      fallback={
        <Box className="flex justify-center items-center min-h-screen">
          <CircularProgress message="Зареждане..." />
        </Box>
      }
    >
      <CancelOrderContent />
    </Suspense>
  );
}
