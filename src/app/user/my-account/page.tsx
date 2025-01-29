"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import AlertMessage from "@/app/ui/components/alert-message";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/app/lib/userSlice";
import { RootState } from "@/app/lib/store";
import CircularProgress from "@/app/ui/components/circular-progress";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  address?: string;
  phone?: string;
}

const fetchUserData = async (token: string) => {
  const response = await fetch("/api/users/update-account", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Възникна грешка при извличане на потребителските данни!");
  }

  return response.json();
};

const updateUserData = async ({
  token,
  userData,
}: {
  token: string;
  userData: UserData;
}) => {
  const response = await fetch("/api/users/update-account", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const responseData = await response.json();
    throw new Error(responseData.message);
  }

  return response.json();
};

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
  const [isVerified, setIsVerified] = useState("");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <CircularProgress message="Зареждане на потребителските данни..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Възникна грешка при зареждане на потребителските данни!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide">
        Моят акаунт
      </h1>
      <div className="text-center mb-4">
        {isVerified ? (
          <span className="text-green-500">Акаунтът Ви е верифициран.</span>
        ) : (
          <span className="text-red-500">Акаунтът Ви не е верифициран.</span>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-4 sm:p-6 space-y-4"
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
          sx={getCustomButtonStyles()}
        >
          {isUpdating ? "Обновяване..." : "Обнови акаунта"}
        </Button>
        {alert && (
          <AlertMessage severity={alert.severity} message={alert.message} />
        )}
      </form>
    </div>
  );
}
