"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import AlertMessage from "@/app/ui/components/alert-message";

export default function DashboardLoginPage() {
  const [customerUsername, setCustomerUsername] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      username: customerUsername,
      password: customerPassword,
    });

    setLoading(false);

    if (result?.error) {
      setAlert({
        message: result.error,
        severity: "error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    } else {
      const redirectUrl = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      router.push(redirectUrl || "/dashboard/products");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-200">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Администраторски Панел - Вход
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextField
            label="Потребителско име"
            autoComplete="current-username"
            variant="outlined"
            fullWidth
            required
            value={customerUsername}
            onChange={(e) => setCustomerUsername(e.target.value)}
          />
          <FormControl variant="outlined" fullWidth required>
            <InputLabel htmlFor="password">Парола</InputLabel>
            <OutlinedInput
              id="password"
              label="Парола"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={customerPassword}
              onChange={(e) => setCustomerPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={getCustomButtonStyles}
            disabled={loading}
          >
            {loading ? "Влизане..." : "Вход"}
          </Button>
          {alert && (
            <div>
              <AlertMessage severity={alert.severity} message={alert.message} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
