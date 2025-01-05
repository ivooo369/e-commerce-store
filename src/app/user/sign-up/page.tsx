"use client";

import { useState } from "react";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import AlertMessage from "@/app/ui/components/alert-message";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/lib/userSlice";
import Link from "next/link";
import AccountBenefits from "@/app/ui/components/account-benefits";

export default function SignUpPage() {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      setAlert({
        message: "Паролата трябва да е поне 8 символа!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    if (password !== confirmPassword) {
      setAlert({
        message: "Паролите не съвпадат!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    setLoading(true);

    const formData = {
      firstName,
      lastName,
      email,
      password,
      city,
      address,
      phone,
    };

    try {
      const response = await fetch("/api/users/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setAlert({
          message: responseData.error,
          severity: "error",
        });
        setLoading(false);
        setTimeout(() => setAlert(null), 5000);
        return;
      }

      localStorage.setItem(
        "userData",
        JSON.stringify({
          token: responseData.token,
          firstName: responseData.user.firstName,
          lastName: responseData.user.lastName,
        })
      );

      dispatch(
        setUser({
          firstName: responseData.user.firstName,
          lastName: responseData.user.lastName,
          authToken: responseData.token,
        })
      );

      setAlert({
        message: responseData.message,
        severity: "success",
      });

      setLoading(false);

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCity("");
      setAddress("");
      setPhone("");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLoading(false);
      setAlert({
        message: "Възникна грешка при обработка на заявката!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide">
        Регистрация
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-4 sm:p-6 space-y-4"
      >
        <AccountBenefits />
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
        <FormControl fullWidth variant="outlined" required>
          <InputLabel htmlFor="password">Парола</InputLabel>
          <OutlinedInput
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Парола"
            inputProps={{ maxLength: 255, autoComplete: "password" }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl fullWidth variant="outlined" required className="mt-4">
          <InputLabel htmlFor="confirmPassword">Потвърдете паролата</InputLabel>
          <OutlinedInput
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Потвърдете паролата"
            inputProps={{ maxLength: 255, autoComplete: "confirm password" }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
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
          disabled={loading}
          fullWidth
          sx={getCustomButtonStyles()}
        >
          {loading ? "Зареждане..." : "Регистрация"}
        </Button>
        <div className="flex justify-center mt-4 text-gray-600 font-semibold">
          <p className="flex text-center flex-col lg:flex-row text-base sm:text-lg">
            Имате акаунт?
            <Link
              href="/user/sign-in"
              className="text-blue-600 hover:underline lg:ml-2"
            >
              Влезте тук
            </Link>
          </p>
        </div>
        {alert && (
          <AlertMessage severity={alert.severity} message={alert.message} />
        )}
      </form>
    </div>
  );
}
