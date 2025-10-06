"use client";

import { clearUser } from "@/lib/store/slices/userSlice";
import AlertMessage from "@/ui/components/feedback/alert-message";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { deleteAccount } from "@/services/userService";
import useProtectedRoute from "@/lib/hooks/useProtectedRoute";
import { RootState } from "@/lib/types/types";

export default function DeleteAccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id: userId } = useSelector((state: RootState) => state.user);

  useProtectedRoute();

  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useAutoDismissAlert(5000);

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: (responseData) => {
      setAlert({
        message:
          typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData
            ? (responseData as { message?: string }).message ||
              "Акаунтът беше успешно изтрит!"
            : "Акаунтът беше успешно изтрит!",
        severity: "success",
      });
      setTimeout(() => {
        localStorage.removeItem("userData");
        dispatch(clearUser());
        router.push("/");
      }, 2000);
      setIsDeleting(false);
    },
    onError: (error: { message: string }) => {
      setAlert({
        message: error.message,
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      setIsDeleting(false);
    },
  });

  const handleDeleteAccount = () => {
    if (!userId) {
      throw new Error("Потребителят не е намерен!");
    }
    mutation.mutate(userId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-243.5px)]">
      <div className="w-full max-w-4xl bg-card-bg shadow-lg rounded-lg p-6 border border-card-border transition-colors duration-300">
        <h1 className="text-2xl sm:text-3xl text-error-color font-bold text-center mb-4 sm:mb-6 tracking-wide">
          Сигурни ли сте, че искате да изтриете акаунта си?
        </h1>
        <h3 className="font-semibold text-lg sm:text-xl text-center mb-6 text-text-secondary">
          Когато изтриете своя акаунт няма да имате възможност:
        </h3>
        <ul className="space-y-4 max-w-2xl mx-auto text-base sm:text-lg text-text-secondary">
          <li className="flex items-center gap-4">
            <FiX className="text-error-color flex-shrink-0" size={35} />
            <span className="leading-6">
              Да запазвате продукти, които са Ви харесали в &quot;Любими&quot;
            </span>
          </li>
          <li className="flex items-center gap-4">
            <FiX className="text-error-color flex-shrink-0" size={35} />
            <span className="leading-6">
              Да преглеждате историята на поръчките, които сте направили
            </span>
          </li>
          <li className="flex items-center gap-4">
            <FiX className="text-error-color flex-shrink-0" size={35} />
            <span className="leading-6">
              Да се възползвате от специални промоции
            </span>
          </li>
        </ul>
        <div className="flex flex-col items-center gap-4 mt-8">
          <Button
            variant="contained"
            color="error"
            className="font-bold"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Изтриване..." : "Изтрий акаунта"}
          </Button>
          <Link
            href="/"
            className="text-base sm:text-lg font-semibold text-blue-600 hover:underline"
          >
            Откажи
          </Link>
        </div>
        {alert && (
          <div className="mt-6">
            <AlertMessage severity={alert.severity} message={alert.message} />
          </div>
        )}
      </div>
    </div>
  );
}
