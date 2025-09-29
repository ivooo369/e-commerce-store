"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import AlertMessage from "@/ui/components/feedback/alert-message";

export default function DashboardLoginPage() {
  const [customerUsername, setCustomerUsername] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const router = useRouter();
  const [alert, setAlert] = useAutoDismissAlert();

  const handleClickShowPassword = () => setIsPasswordVisible((show) => !show);

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const mutation = useMutation({
    mutationFn: async () => {
      return await signIn("credentials", {
        redirect: false,
        username: customerUsername,
        password: customerPassword,
      });
    },
    onMutate: () => {
      setIsEntering(true);
    },
    onSuccess: (result) => {
      setIsEntering(false);
      if (result?.error) {
        setAlert({
          message: result.error,
          severity: "error",
        });
      } else {
        const redirectUrl = new URLSearchParams(window.location.search).get(
          "redirect"
        );
        router.push(redirectUrl || "/dashboard/products");
      }
    },
    onError: (error) => {
      setIsEntering(false);
      setAlert({
        message: error.message,
        severity: "error",
      });
    },
  });

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-bg-secondary transition-colors duration-300">
      <div className="bg-card-bg p-6 rounded-lg shadow-2xl w-full max-w-lg border border-card-border transition-colors duration-300">
        <h1 className="text-2xl font-bold text-center mb-6 tracking-wide text-text-primary">
          Администраторски Панел - Вход
        </h1>
        <form className="space-y-4" onSubmit={handleSignIn}>
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
              type={isPasswordVisible ? "text" : "password"}
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
                    {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
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
            disabled={isEntering}
          >
            {isEntering ? "Влизане..." : "Вход"}
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
