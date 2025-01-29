"use client";

import { clearUser } from "@/app/lib/userSlice";
import AlertMessage from "@/app/ui/components/alert-message";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";

const deleteAccount = async (userId: string) => {
  const response = await fetch(`/api/users/delete-account/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message);
  }

  return responseData;
};

export default function DeleteAccountPage() {
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [userData, setUserData] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("userData");
      setUserData(storedUserData);
    }
  }, []);

  let userId: string | undefined;

  if (userData) {
    const parsedUserData = JSON.parse(userData);
    userId = parsedUserData.id;
    console.log(userId);
  } else {
    console.log("Няма записани потребителски данни в localStorage!");
  }

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: (responseData) => {
      setAlert({
        message: responseData.message || "Акаунтът беше успешно изтрит!",
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
      console.error("Потребителят не е намерен!");
      return;
    }

    mutation.mutate(userId);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <div className="container mx-auto max-w-4xl bg-white shadow-lg rounded-lg px-4 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl text-red-600 font-bold text-center mb-4 sm:mb-6 tracking-wide">
          Сигурни ли сте, че искате да изтриете акаунта си?
        </h1>
        <h3 className="font-semibold text-lg sm:text-xl text-center mb-3 text-gray-600">
          Когато изтриете своя акаунт няма да имате възможност:
        </h3>
        <ul className="space-y-2 text-base sm:text-lg m-auto w-3/5 text-gray-600">
          <li className="flex items-center gap-4">
            <FiX className="text-red-500 flex-shrink-0" size={35} />
            <span className="leading-6">
              Да преглеждате историята на поръчките, които сте направили
            </span>
          </li>
          <li className="flex items-center gap-4">
            <FiX className="text-red-500 flex-shrink-0" size={35} />
            <span className="leading-6">
              Да се възползвате от специални промоции
            </span>
          </li>
          <li className="flex items-center gap-4">
            <FiX className="text-red-500 flex-shrink-0" size={35} />
            <span className="leading-6">
              Да запазвате продукти, които са Ви харесали в &quot;Любими&quot;
            </span>
          </li>
        </ul>
        <div className="flex flex-col items-center gap-2 mt-4">
          <Button
            variant="contained"
            color="error"
            sx={{
              fontWeight: "bold",
              margin: "auto",
            }}
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Изтриване..." : "Изтрий акаунта"}
          </Button>
          <Link
            href="/"
            className="text-base sm:text-lg font-semibold text-blue-600 hover:underline"
          >
            Отказ
          </Link>
        </div>
        {alert && (
          <div className="mt-4">
            <AlertMessage severity={alert.severity} message={alert.message} />
          </div>
        )}
      </div>
    </div>
  );
}
