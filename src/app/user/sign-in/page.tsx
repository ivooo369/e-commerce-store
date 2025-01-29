"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

const signIn = async (formData: { email: string; password: string }) => {
  const response = await fetch("/api/users/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.message || "Възникна грешка при обработка на заявката!"
    );
  }

  return responseData;
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [signingIn, setIsSigningIn] = useState(false);
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

  const mutation = useMutation({
    mutationFn: signIn,
    onMutate: () => {
      setIsSigningIn(true);
    },
    onSuccess: (responseData) => {
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
      router.push("/");
      setIsSigningIn(false);
    },
    onError: (error: { message: string }) => {
      setAlert({
        message: error.message,
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      setIsSigningIn(false);
    },
  });

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = { email, password };
    mutation.mutate(formData);
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
          disabled={signingIn}
        >
          {signingIn ? "Влизане..." : "Влез в акаунта си"}
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
