"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AlertMessage from "@/ui/components/feedback/alert-message";
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
import { setUser } from "@/lib/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AccountBenefits from "@/ui/components/others/account-benefits";
import { signIn } from "@/services/userService";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { cartService } from "@/services/cartService";
import { setCartItems } from "@/lib/store/slices/cartSlice";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [signingIn, setIsSigningIn] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [alert, setAlert] = useAutoDismissAlert();

  const handleClickShowPassword = () => setIsPasswordVisible((show) => !show);
  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const mutation = useMutation({
    mutationFn: signIn,
    onMutate: () => {
      setIsSigningIn(true);
    },
    onSuccess: async (responseData) => {
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

      try {
        const cartItems = await cartService.getCartItems(responseData.user.id);
        dispatch(setCartItems(cartItems));
      } catch {
        throw new Error(
          "Възникна грешка при извличане на продуктите от количката!"
        );
      }

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
      setIsSigningIn(false);
    },
  });

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = {
      email: email.trim(),
      password: password.trim(),
    };
    mutation.mutate(formData);
  };

  return (
    <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-[calc(100vh-243.5px)]">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Вход в потребителски акаунт
      </h1>
      <form
        onSubmit={handleSignIn}
        className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
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
          className="font-bold w-full bg-blue-500 hover:bg-blue-600 text-white"
          fullWidth
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
