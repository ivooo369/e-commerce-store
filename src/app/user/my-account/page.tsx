"use client";

import { useState, useEffect } from "react";
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

export default function MyAccountPage() {
  const dispatch = useDispatch();
  const signedInUser = useSelector((state: RootState) => state.user);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");

    if (savedUserData) {
      const userData = JSON.parse(savedUserData);

      dispatch(
        setUser({
          id: userData.id || null,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          token: userData.token || null,
          isLoggedIn: userData.isLoggedIn || null,
        })
      );
    }

    const savedUserAccountData = localStorage.getItem("userAccountData");

    if (savedUserAccountData) {
      const userAccountData = JSON.parse(savedUserAccountData);
      setFirstName(userAccountData.firstName || "");
      setLastName(userAccountData.lastName || "");
      setEmail(userAccountData.email || "");
      setCity(userAccountData.city || "");
      setAddress(userAccountData.address || "");
      setPhone(userAccountData.phone || "");
      setIsVerified(userAccountData.isVerified);
      setIsLoading(false);
    } else {
      const fetchUserData = async () => {
        try {
          if (!savedUserData) {
            setIsLoading(false);
            return;
          }

          const userData = JSON.parse(savedUserData);
          if (!userData.token) {
            setIsLoading(false);
            return;
          }

          setIsLoading(true);
          const response = await fetch("/api/users/update-account", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          });

          if (!response.ok) {
            throw new Error(
              "Възникна грешка при извличане на потребителските данни!"
            );
          }

          const userDataFromServer = await response.json();
          localStorage.setItem(
            "userAccountData",
            JSON.stringify({
              firstName: userDataFromServer.firstName,
              lastName: userDataFromServer.lastName,
              email: userDataFromServer.email,
              city: userDataFromServer.city,
              address: userDataFromServer.address,
              phone: userDataFromServer.phone,
              isVerified: userDataFromServer.isVerified,
            })
          );

          setFirstName(userDataFromServer.firstName);
          setLastName(userDataFromServer.lastName);
          setEmail(userDataFromServer.email);
          setCity(userDataFromServer.city);
          setAddress(userDataFromServer.address);
          setPhone(userDataFromServer.phone);
          setIsVerified(userDataFromServer.isVerified);
        } catch (error) {
          console.error(
            "Възникна грешка при извличане на потребителските данни:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsUpdating(true);

    try {
      const response = await fetch("/api/users/update-account", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${signedInUser.token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          city,
          address,
          phone,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setAlert({
          message: responseData.error,
          severity: "error",
        });
        setIsUpdating(false);
        setTimeout(() => setAlert(null), 5000);
        return;
      }

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

      setIsUpdating(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsUpdating(false);
      setAlert({
        message: "Възникна грешка при обработка на заявката!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <CircularProgress message="Зареждане на потребителските данни..." />
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
