"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import AlertMessage from "@/ui/components/alert-message";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/lib/userSlice";
import { RootState } from "@/lib/store";
import CircularProgress from "@/ui/components/circular-progress";
import { fetchUserData, updateUserData } from "@/services/userService";

export default function MyAccountPage() {
  const dispatch = useDispatch();
  const signedInUser = useSelector((state: RootState) => state.user);
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

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
              <>
                <svg
                  className="h-5 w-5 text-red-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">
                  Акаунтът Ви не е верифициран
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <CircularProgress message="Зареждане на данните..." />
        </div>
      ) : isError ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-text-primary">
            Възникна грешка при зареждане на данните
          </h2>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
        >
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="firstName">Име</InputLabel>
            <OutlinedInput
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              label="Име"
              inputProps={{ maxLength: 50, autoComplete: "first name" }}
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="lastName">Фамилия</InputLabel>
            <OutlinedInput
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              label="Фамилия"
              inputProps={{ maxLength: 50, autoComplete: "last name" }}
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="email">E-mail</InputLabel>
            <OutlinedInput
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="E-mail"
              inputProps={{ maxLength: 255, autoComplete: "email" }}
            />
          </FormControl>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="city">Град</InputLabel>
            <OutlinedInput
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              label="Град"
              inputProps={{ maxLength: 100, autoComplete: "city" }}
            />
          </FormControl>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="address">Адрес</InputLabel>
            <OutlinedInput
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              label="Адрес"
              inputProps={{ maxLength: 255, autoComplete: "address" }}
            />
          </FormControl>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="phone">Телефон</InputLabel>
            <OutlinedInput
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              label="Телефон"
              inputProps={{ maxLength: 20, autoComplete: "phone" }}
            />
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isUpdating}
            fullWidth
          >
            {isUpdating ? "Обновяване..." : "Обнови акаунта"}
          </Button>
          {alert && (
            <AlertMessage severity={alert.severity} message={alert.message} />
          )}
        </form>
      )}
    </div>
  );
}
