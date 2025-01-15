"use client";

import { useState } from "react";
import AlertMessage from "@/app/ui/components/alert-message";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import { setUser } from "@/app/lib/userSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AccountBenefits from "@/app/ui/components/account-benefits";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleClickShowPassword = () => setIsPasswordVisible((show) => !show);
  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    const formData = { email, password };

    try {
      const response = await fetch("/api/users/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setAlert({
          message: responseData.error,
          severity: "error",
        });
        setIsLoading(false);
        setTimeout(() => setAlert(null), 5000);
        return;
      }

      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: responseData.user.id,
          firstName: responseData.user.firstName,
          lastName: responseData.user.lastName,
          token: responseData.token,
        })
      );

      dispatch(
        setUser({
          id: responseData.user.id,
          firstName: responseData.user.firstName,
          lastName: responseData.user.lastName,
          token: responseData.token,
          isLoggedIn: responseData.isLoggedIn,
        })
      );

      setAlert({
        message: responseData.message,
        severity: "success",
      });
      setIsLoading(false);
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsLoading(false);
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
        Вход в потребителски акаунт
      </h1>
      <form
        onSubmit={handleSignIn}
        className="bg-white shadow-lg rounded-lg p-4 sm:p-6 space-y-4"
      >
        <AccountBenefits />
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
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Парола"
            inputProps={{ maxLength: 255, autoComplete: "current-password" }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={getCustomButtonStyles}
          disabled={isLoading}
        >
          {isLoading ? "Влизане..." : "Влез в акаунта си"}
        </Button>
        <p className="flex justify-center items-center gap-1.5 text-base sm:text-lg font-semibold">
          Нямате акаунт?
          <Link href="/user/sign-up" className="text-blue-600 hover:underline">
            Регистрирайте се тук
          </Link>
        </p>
        {alert && (
          <div>
            <AlertMessage severity={alert.severity} message={alert.message} />
          </div>
        )}
      </form>
    </div>
  );
}
