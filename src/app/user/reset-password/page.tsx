import { Suspense } from "react";
import ResetPasswordForm from "@/ui/components/forms/reset-password-form";
import CircularSize from "@/ui/components/feedback/circular-progress";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-[calc(100vh-243.5px)]">
          <div className="flex justify-center items-center">
            <CircularSize message="Зареждане..." />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
