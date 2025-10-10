"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import useProtectedRoute from "@/lib/hooks/useProtectedRoute";
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
import { changePassword } from "@/services/userService";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { useDispatch } from "react-redux";
import { clearUser } from "@/lib/store/slices/userSlice";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  useProtectedRoute();
  const dispatch = useDispatch();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [alert, setAlert] = useAutoDismissAlert(5000);

  const handleClickShowPassword = (field: string) => {
    if (field === "current") setIsCurrentPasswordVisible((show) => !show);
    if (field === "new") setIsNewPasswordVisible((show) => !show);
    if (field === "confirm") setIsConfirmPasswordVisible((show) => !show);
  };

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const mutation = useMutation({
    mutationFn: changePassword,
    retry: false,
    onMutate: () => {
      setIsChanging(true);
      setAlert(null);
    },
    onSuccess: (responseData) => {
      setAlert({
        message:
          responseData.message ||
          "Паролата беше сменена успешно! Ще бъдете изведени от акаунта си за сигурност.",
        severity: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      dispatch(clearUser());
      localStorage.removeItem("userData");

      setTimeout(() => {
        router.push("/user/sign-in");
      }, 2000);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Възникна грешка при смяна на паролата!";
      setAlert({
        message: errorMessage,
        severity: "error",
      });
    },
    onSettled: () => {
      setIsChanging(false);
    },
  });

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);

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
      currentPassword: currentPassword.trim(),
      newPassword: newPassword.trim(),
    };

    mutation.mutate(formData);
  };

  return (
    <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-[calc(100vh-243.5px)]">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Смяна на парола
      </h1>
      <form
        onSubmit={handleChangePassword}
        className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
      >
        <FormControl
          fullWidth
          variant="outlined"
          required
          aria-label="Въведете текущата парола"
        >
          <InputLabel htmlFor="current-password">Текуща парола</InputLabel>
          <OutlinedInput
            id="current-password"
            name="currentPassword"
            type={isCurrentPasswordVisible ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            label="Текуща парола"
            inputProps={{ maxLength: 255, autoComplete: "current-password" }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleClickShowPassword("current")}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {isCurrentPasswordVisible ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
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
          variant="contained"
          className="font-bold"
          color="primary"
          fullWidth
          disabled={isChanging}
        >
          {isChanging ? "Смяна..." : "Смени паролата"}
        </Button>

        <p className="flex justify-center items-center gap-1.5 text-base sm:text-lg font-semibold">
          Забравили сте паролата си?
          <Link
            href="/user/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Сменете я тук
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
