"use client";

import { useEffect } from "react";
import { Button } from "@mui/material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Възникна грешка:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-243.5px)] flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-md w-full space-y-6 text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-800/30">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-red-600 dark:text-red-500">
            {error.digest ? error.digest.substring(0, 3) : "500"}
          </h1>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl">
            Възникна неочаквана грешка
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            {error.message || "Моля, опитайте отново по-късно!"}
          </p>
          <div className="mt-6">
            <Button
              variant="contained"
              color="error"
              onClick={() => reset()}
              className="w-full sm:w-auto font-bold"
            >
              Опитайте отново
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
