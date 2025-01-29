"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const verifyEmail = async (token: string) => {
  const response = await fetch(`/api/users/verify-email?token=${token}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};

export default function VerifyEmail() {
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    setToken(token);
  }, []);

  const { isLoading, data, error } = useQuery({
    queryKey: ["verifyEmail", token],
    queryFn: () => verifyEmail(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (!token) {
      setMessage("Токенът е невалиден!");
      return;
    }

    if (data) {
      if (data.message) {
        setSuccessMessage(data.message);
        if (data.user && data.user.firstName) {
          setCustomerName(data.user.firstName);
        }
      }
    }

    if (error) {
      setMessage((error as { message: string }).message);
    }
  }, [token, data, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 text-sm sm:text-lg">
            Моля, изчакайте...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xl sm:max-w-3xl text-center border border-gray-300">
        {successMessage && (
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-4 tracking-wide">
            {successMessage}
          </h1>
        )}
        {message && !successMessage && (
          <h1 className="text-2xl sm:text-3xl font-bold text-red-700 mb-4 tracking-wide">
            {message}
          </h1>
        )}
        <div className="mt-4 text-gray-700 text-base sm:text-lg">
          {successMessage === "Вашият имейл беше успешно потвърден!" ? (
            <p>
              Поздравления, <strong>{customerName}</strong>! Вече сте напълно
              верифициран клиент на нашия магазин и ще имате достъп до специални
              промоции, които са налични само за регистрирани и верифицирани
              потребители.
            </p>
          ) : (
            <p>Моля, проверете информацията и опитайте отново!</p>
          )}
        </div>
        <div className="mt-4">
          <Link
            href="/"
            className="text-blue-700 hover:underline text-lg sm:text-xl font-bold"
          >
            Обратно към началната страница
          </Link>
        </div>
      </div>
    </div>
  );
}
