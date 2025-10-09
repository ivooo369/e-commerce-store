"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import AlertMessage from "@/ui/components/feedback/alert-message";
import { FormControl, InputLabel, OutlinedInput, Button } from "@mui/material";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { forgotPassword } from "@/services/userService";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/types/types";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [alert, setAlert] = useAutoDismissAlert();

  const user = useSelector((state: RootState) => state.user);
  const isLoggedIn = user.isLoggedIn;

  useEffect(() => {
    if (isLoggedIn) {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.token) {
            const tokenParts = parsedUserData.token.split(".");
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              if (payload.email) {
                setEmail(payload.email);
              }
            }
          }
        } catch {
          throw new Error(
            "Възникна грешка при обработка на данните за потребителя!"
          );
        }
      }
    }
  }, [isLoggedIn]);

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onMutate: () => {
      setIsSending(true);
      setAlert(null);
    },
    onSuccess: (responseData) => {
      setAlert({
        message:
          responseData.message ||
          "Имейл с инструкции за смяна на паролата е изпратен!",
        severity: "success",
      });
      setEmail("");
    },
    onError: (error: Error) => {
      setAlert({
        message: error.message || "Възникна грешка при изпращане на имейла!",
        severity: "error",
      });
    },
    onSettled: () => {
      setIsSending(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setAlert({
        message: "Моля, въведете имейл адрес!",
        severity: "error",
      });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setAlert({
        message: "Моля, въведете валиден имейл адрес!",
        severity: "error",
      });
      return;
    }

    mutation.mutate(email.trim());
  };

  return (
    <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-[calc(100vh-243.5px)]">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Забравена парола
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300 max-w-lg mx-auto"
      >
        <p className="text-center text-gray-600 mb-4">
          {isLoggedIn
            ? "Ще изпратим инструкции за смяна на паролата на вашия имейл адрес."
            : "Въведете имейл адреса си и ще Ви изпратим инструкции за смяна на паролата."}
        </p>

        <FormControl fullWidth variant="outlined" required>
          <InputLabel htmlFor="email">E-mail</InputLabel>
          <OutlinedInput
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="E-mail"
            inputProps={{
              maxLength: 255,
              autoComplete: "email",
            }}
          />
        </FormControl>

        <Button
          type="submit"
          className="font-bold"
          color="primary"
          variant="contained"
          fullWidth
          disabled={isSending}
        >
          {isSending ? "Получаване..." : "Получи инструкции"}
        </Button>

        {alert && (
          <div>
            <AlertMessage severity={alert.severity} message={alert.message} />
          </div>
        )}
      </form>
    </div>
  );
}
