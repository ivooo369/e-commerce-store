"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return true;
    }
  };

  const handleClickShowPassword = (field: string) => {
    if (field === "current") setShowCurrentPassword((show) => !show);
    if (field === "new") setShowNewPassword((show) => !show);
    if (field === "confirm") setShowConfirmPassword((show) => !show);
  };

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setAlert({
        message: "Паролите не съвпадат!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    setLoading(true);

    const formData = { currentPassword, newPassword };

    try {
      const userData = localStorage.getItem("userData");
      const parsedUserData = userData ? JSON.parse(userData) : null;
      const token = parsedUserData?.token || "";

      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

      setAlert({
        message: responseData.message,
        severity: "success",
      });
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
      router.push("/");
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
        Смяна на парола
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-4 sm:p-6 space-y-4"
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
            type={showCurrentPassword ? "text" : "password"}
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
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
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
            type={showNewPassword ? "text" : "password"}
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
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
            type={showConfirmPassword ? "text" : "password"}
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
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
          disabled={loading}
        >
          {loading ? "Обработване..." : "Смени паролата"}
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
