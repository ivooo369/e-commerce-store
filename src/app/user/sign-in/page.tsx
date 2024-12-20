"use client";

import { useState } from "react";
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

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const formData = {
      email,
      password,
    };

    try {
      const response = await fetch("/api/users/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setAlert({
          message: responseData.error || "Възникна грешка при входа!",
          severity: "error",
        });
        setLoading(false);
        setTimeout(() => setAlert(null), 5000);
        return;
      }

      setAlert({
        message: responseData.message || "Успешен вход!",
        severity: "success",
      });
      setLoading(false);
      setTimeout(() => {
        setAlert({
          message: responseData.message || "Успешен вход!",
          severity: "success",
        });
        setLoading(false);

        const redirectUrl = new URLSearchParams(window.location.search).get(
          "redirect"
        );
        router.push(redirectUrl || "/");
      }, 1000);

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
    <div className="container m-auto p-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4 tracking-wide">
        Вход в потребителски акаунт
      </h2>
      <p className="text-center text-lg text-gray-500 mb-8">
        Когато влезете в своя потребителски акаунт, ще имате достъп до специални
        намаления, които не са налични за клиенти, разглеждащи електронния
        магазин като гости.
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 space-y-4"
      >
        <FormControl fullWidth variant="outlined" required>
          <InputLabel htmlFor="email">E-mail</InputLabel>
          <OutlinedInput
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="E-mail"
            inputProps={{ maxLength: 255 }}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined" required>
          <InputLabel htmlFor="password">Парола</InputLabel>
          <OutlinedInput
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Парола"
            inputProps={{ maxLength: 255 }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
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
          {loading ? "Влизане..." : "Влезте в акаунта си"}
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
