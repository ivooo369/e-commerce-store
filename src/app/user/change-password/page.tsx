"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import AlertMessage from "@/ui/components/alert-message";
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

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("userData");

    if (!token || isTokenExpired(token)) {
      router.push("/user/sign-in");
    }
  }, [router]);

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

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
    onMutate: () => {
      setIsChanging(true);
    },
    onSuccess: (responseData) => {
      setAlert({
        message: responseData.message,
        severity: "success",
      });
      setTimeout(() => {
        setAlert(null);
        router.push("/");
      }, 1500);
      setIsChanging(false);
    },
    onError: (error: { message: string }) => {
      setAlert({
        message: error.message,
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      setIsChanging(false);
    },
  });

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setAlert({
        message: "Новата парола и паролата за потвърждение не съвпадат!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    const formData = { currentPassword, newPassword };
    mutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-screen">
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
          color="primary"
          fullWidth
          disabled={isChanging}
        >
          {isChanging ? "Обработване..." : "Смени паролата"}
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
