"use client";

import { useState, useEffect } from "react";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/lib/store/slices/userSlice";
import { RootState } from "@/lib/store/store";
import useProtectedRoute from "@/lib/hooks/useProtectedRoute";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import {
  fetchUserData,
  updateUserData,
  resendVerificationEmail,
} from "@/services/userService";
import { AccountUpdateForm } from "@/ui/components/forms/account-update-form";
import Box from "@mui/material/Box";

export default function MyAccountPage() {
  const dispatch = useDispatch();
  const signedInUser = useSelector((state: RootState) => state.user);

  useProtectedRoute();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useAutoDismissAlert(5000);

  const [isResending, setIsResending] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userAccountData", signedInUser.token],
    queryFn: () => fetchUserData(signedInUser.token!),
    enabled: !!signedInUser.token,
  });

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      const userData = JSON.parse(savedUserData);
      dispatch(setUser(userData));
    }

    if (data) {
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setEmail(data.email || "");
      setCity(data.city || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
      setIsVerified(data.isVerified);

      localStorage.setItem(
        "userAccountData",
        JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          city: data.city,
          address: data.address,
          phone: data.phone,
          isVerified: data.isVerified,
        })
      );
    }
  }, [data, dispatch]);

  const mutation = useMutation({
    mutationFn: updateUserData,
    onSuccess: () => {
      setAlert({
        message: "Информацията беше успешно обновена!",
        severity: "success",
      });

      localStorage.setItem(
        "userAccountData",
        JSON.stringify({
          firstName,
          lastName,
          email,
          city,
          address,
          phone,
          isVerified,
        })
      );

      dispatch(
        setUser({
          ...signedInUser,
          firstName,
          lastName,
        })
      );

      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...signedInUser,
          firstName,
          lastName,
        })
      );

      queryClient.invalidateQueries({
        queryKey: ["userAccountData", signedInUser.token!],
      });
    },
    onError: (error: { message: string }) => {
      setAlert({
        message: error.message,
        severity: "error",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (phone) {
      const phoneRegex = /^\d{10,20}$/;
      if (!phoneRegex.test(phone)) {
        setAlert({
          message: "Моля, въведете валиден телефонен номер!",
          severity: "error",
        });
        return;
      }
    }

    setIsUpdating(true);

    mutation.mutate({
      token: signedInUser.token!,
      userData: {
        firstName,
        lastName,
        email,
        city,
        address,
        phone,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Моят акаунт
      </h1>
      <div className="flex justify-center mb-6">
        <div
          className={`px-4 py-2.5 rounded-lg shadow-md w-full max-w-md transition-all duration-300 ${
            isVerified === null
              ? "bg-gray-100 text-gray-800"
              : isVerified
              ? "bg-green-200 text-green-900 border border-green-300"
              : "bg-red-200 text-red-900 border border-red-300"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isVerified === null ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="font-semibold">Проверка на статуса...</span>
              </>
            ) : isVerified ? (
              <>
                <svg
                  className="h-5 w-5 text-green-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Акаунтът Ви е верифициран</span>
              </>
            ) : (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="h-5 w-5 text-red-700 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold text-base">
                    Акаунтът Ви не е верифициран
                  </span>
                </div>
                <Button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (isResending) return;
                    setIsResending(true);
                    try {
                      await resendVerificationEmail(signedInUser.token!);
                      setAlert({
                        message:
                          "Регистрацията Ви е почти готова! Моля, отворете имейла си и кликнете върху линка за верификация!",
                        severity: "success",
                      });
                    } catch (error) {
                      setAlert({
                        message:
                          error instanceof Error
                            ? error.message
                            : "Възникна грешка при изпращане на имейл за верификация!",
                        severity: "error",
                      });
                    } finally {
                      setIsResending(false);
                      setTimeout(() => setAlert(null), 5000);
                    }
                  }}
                  disabled={isResending}
                  variant="contained"
                  color="primary"
                  className="font-bold"
                  fullWidth
                >
                  {isResending ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Изпращане...
                    </span>
                  ) : (
                    "Получи имейл за потвърждение"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isLoading ? (
        <Box className="flex justify-center items-center py-10">
          <CircularProgress message="Зареждане на данните..." />
        </Box>
      ) : isError ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-text-primary">
            Възникна грешка при зареждане на данните
          </h2>
        </div>
      ) : (
        <AccountUpdateForm
          formState={{
            firstName,
            lastName,
            email,
            city,
            address,
            phone,
          }}
          isUpdating={isUpdating}
          alert={alert}
          onInputChange={(e) => {
            const { name, value } = e.target;
            switch (name) {
              case "firstName":
                setFirstName(value);
                break;
              case "lastName":
                setLastName(value);
                break;
              case "email":
                setEmail(value);
                break;
              case "city":
                setCity(value);
                break;
              case "address":
                setAddress(value);
                break;
              case "phone":
                setPhone(value);
                break;
            }
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
