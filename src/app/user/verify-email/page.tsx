"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyEmail() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [customerName, setCustomertName] = useState("");

  useEffect(() => {
    if (successMessage) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      fetch(`/api/users/verify-email?token=${token}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            setSuccessMessage(data.message);
            if (data.user && data.user.firstName) {
              setCustomertName(data.user.firstName);
            }
          } else if (data.error) {
            setMessage(data.error);
          }
        })

        .catch((error) => {
          setMessage("Възникна грешка при потвърждаване на имейла!");
          console.error("Възникна грешка при потвърждаване на имейла:", error);
        })
        .finally(() => setLoading(false));
    } else {
      setMessage("Токенът е невалиден!");
      setLoading(false);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 text-lg">Моля, изчакайте...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl text-center border border-gray-300">
        {successMessage && (
          <h1 className="text-3xl font-bold text-green-700 mb-4">
            {successMessage}
          </h1>
        )}
        {message && !successMessage && (
          <h1 className="text-3xl font-bold text-red-700 mb-4">{message}</h1>
        )}
        <div className="mt-4 text-gray-700 text-lg">
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
        <div className="mt-6">
          <Link
            href="/"
            className="text-blue-700 hover:underline text-xl font-bold"
          >
            Обратно към началната страница
          </Link>
        </div>
      </div>
    </div>
  );
}
