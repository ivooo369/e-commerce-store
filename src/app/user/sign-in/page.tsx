"use client";

import { useState, useEffect } from "react";
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
  Divider,
  Box,
} from "@mui/material";
import { setUser } from "@/lib/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AccountBenefits from "@/ui/components/others/account-benefits";
import { signIn, googleOAuthSignIn } from "@/services/userService";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { cartService } from "@/services/cartService";
import { setCartItems } from "@/lib/store/slices/cartSlice";
import { signIn as nextAuthSignIn, useSession } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [signingIn, setIsSigningIn] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [alert, setAlert] = useAutoDismissAlert();
  const { data: session, status } = useSession();

  const handleClickShowPassword = () => setIsPasswordVisible((show) => !show);
  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isGoogleSuccess = urlParams.get("google") === "success";

    if (isGoogleSuccess && session?.user && status === "authenticated") {
      const user = session.user;

      const handleGoogleSignin = async () => {
        try {
          const data = await googleOAuthSignIn(user.email!);

          localStorage.setItem(
            "userData",
            JSON.stringify({
              id: data.user.id,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              token: data.token,
            })
          );

          dispatch(
            setUser({
              id: data.user.id,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              token: data.token,
              isLoggedIn: data.isLoggedIn,
            })
          );

          try {
            const cartItems = await cartService.getCartItems(data.user.id);
            dispatch(setCartItems(cartItems));
          } catch {
            throw new Error("Възникна грешка при зареждане на количката!");
          }

          setAlert({
            message: data.message,
            severity: "success",
          });

          window.history.replaceState({}, document.title, "/user/sign-in");
          router.push("/");
        } catch (error) {
          setAlert({
            message:
              error instanceof Error
                ? error.message
                : "Възникна грешка при влизане с Google акаунт!",
            severity: "error",
          });
        }
      };

      handleGoogleSignin();
    }
  }, [session, status, dispatch, router, setAlert]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);

      await nextAuthSignIn("google", {
        redirect: true,
        callbackUrl: "/user/sign-in?google=success",
      });
    } catch {
      setAlert({
        message: "Възникна грешка при влизане с Google акаунт!",
        severity: "error",
      });
      setIsSigningIn(false);
    }
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
          className="font-bold"
          color="primary"
          variant="contained"
          fullWidth
          disabled={signingIn}
        >
          {signingIn ? "Влизане..." : "Влез в акаунта си"}
        </Button>

        <Box className="flex items-center my-4">
          <Divider className="flex-1" />
          <span className="px-3 text-gray-500 text-sm">или</span>
          <Divider className="flex-1" />
        </Box>

        <Button
          onClick={handleGoogleSignIn}
          className="font-bold"
          variant="outlined"
          fullWidth
          disabled={signingIn}
          startIcon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          Влез с Google акаунт
        </Button>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-base">
          <span>
            <span className="font-semibold">Нямате акаунт?</span>{" "}
            <Link
              href="/user/sign-up"
              className="text-blue-600 hover:underline font-medium"
            >
              Регистрирайте се
            </Link>
          </span>
          <span className="hidden sm:inline text-gray-400">•</span>
          <span>
            <span className="font-semibold">Забравили сте паролата си?</span>{" "}
            <Link
              href="/user/forgot-password"
              className="text-blue-600 hover:underline font-medium"
            >
              Сменете я
            </Link>
          </span>
        </div>
        {alert && (
          <div>
            <AlertMessage severity={alert.severity} message={alert.message} />
          </div>
        )}
      </form>
    </div>
  );
}
