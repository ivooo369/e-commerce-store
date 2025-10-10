"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { resetPassword } from "@/services/userService";
import { useDispatch } from "react-redux";
import { clearUser } from "@/lib/store/slices/userSlice";
import CircularSize from "@/ui/components/feedback/circular-progress";

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [alert, setAlert] = useAutoDismissAlert();
  const dispatch = useDispatch();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setIsValidToken(true);
    } else {
      setAlert({
        message: "Невалиден или липсващ токен за смяна на паролата!",
        severity: "error",
      });
    }
    setIsLoading(false);
  }, [searchParams, setAlert]);

  const handleClickShowPassword = (field: string) => {
    if (field === "new") setIsNewPasswordVisible((show) => !show);
    if (field === "confirm") setIsConfirmPasswordVisible((show) => !show);
  };

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const mutation = useMutation({
    mutationFn: resetPassword,
    retry: false,
    onMutate: () => {
      setIsResetting(true);
      setAlert(null);
    },
    onSuccess: (responseData) => {
      setAlert({
        message: responseData.message || "Паролата беше сменена успешно!",
        severity: "success",
      });
      setNewPassword("");
      setConfirmPassword("");

      dispatch(clearUser());
      localStorage.removeItem("userData");

      setTimeout(() => {
        router.push("/user/sign-in");
      }, 2000);
    },
    onError: (error: Error) => {
      setAlert({
        message: error.message || "Възникна грешка при смяна на паролата!",
        severity: "error",
      });
    },
    onSettled: () => {
      setIsResetting(false);
    },
  });

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);

    if (!token) {
      setAlert({
        message: "Невалиден токен за смяна на паролата!",
        severity: "error",
      });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setAlert({
        message: "Новата парола и паролата за потвърждение не съвпадат!",
        severity: "error",
      });
      return;
    }

    if (newPassword.trim().length < 8) {
      setAlert({
        message: "Паролата трябва да бъде поне 8 символа!",
        severity: "error",
      });
      return;
    }

    const formData = {
      token,
      newPassword: newPassword.trim(),
    };

    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-[calc(100vh-243.5px)]">
        <div className="flex justify-center items-center">
          <CircularSize message="Зареждане..." />
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-[calc(100vh-243.5px)]">
        <div className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 border border-card-border transition-colors duration-300 max-w-md mx-auto">
          {alert && (
            <div>
              <AlertMessage severity={alert.severity} message={alert.message} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-[calc(100vh-243.5px)]">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Смяна на парола
      </h1>
      <form
        onSubmit={handleResetPassword}
        className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300 max-w-lg mx-auto"
      >
        <p className="text-center text-gray-600 mb-4">
          Въведете новата си парола.
        </p>

        <FormControl
          fullWidth
          variant="outlined"
          required
          aria-label="Въведете новата парола"
        >
          <InputLabel htmlFor="new-password">Нова парола</InputLabel>
          <OutlinedInput
            id="new-password"
            type={isNewPasswordVisible ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            label="Нова парола"
            inputProps={{ maxLength: 255, autoComplete: "new-password" }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleClickShowPassword("new")}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {isNewPasswordVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        <FormControl
          fullWidth
          variant="outlined"
          required
          aria-label="Потвърдете новата парола"
        >
          <InputLabel htmlFor="confirm-new-password">
            Потвърдете новата парола
          </InputLabel>
          <OutlinedInput
            id="confirm-new-password"
            type={isConfirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Потвърдете новата парола"
            inputProps={{ maxLength: 255, autoComplete: "new-password" }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleClickShowPassword("confirm")}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {isConfirmPasswordVisible ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
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
          disabled={isResetting}
        >
          {isResetting ? "Смяна..." : "Смени паролата"}
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
