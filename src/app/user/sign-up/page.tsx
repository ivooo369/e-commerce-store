"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import AlertMessage from "@/app/ui/components/alert-message";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      setAlert({
        message: "Паролата трябва да е поне 8 символа!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    if (password !== confirmPassword) {
      setAlert({
        message: "Паролите не съвпадат!",
        severity: "error",
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    setLoading(true);

    const formData = {
      firstName,
      lastName,
      email,
      password,
      city,
      address,
      phone,
    };

    try {
      const response = await fetch("/api/users/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setAlert({
          message: responseData.error || "Възникна грешка при регистрацията!",
          severity: "error",
        });
        setLoading(false);
        setTimeout(() => setAlert(null), 5000);
        return;
      }

      setAlert({
        message: responseData.message || "Успешна регистрация!",
        severity: "success",
      });
      setLoading(false);
      setTimeout(() => {
        setAlert({
          message: responseData.message || "Успешна регистрация!",
          severity: "success",
        });
        setLoading(false);

        const redirectUrl = new URLSearchParams(window.location.search).get(
          "redirect"
        );
        router.push(redirectUrl || "/");
      }, 1000);

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCity("");
      setAddress("");
      setPhone("");
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
        Регистрация
      </h2>
      <p className="text-center text-lg text-gray-500 mb-8">
        Чрез създаване на акаунт в електронния магазин ще получите достъп до
        специални намаления, които не са налични за клиенти, разглеждащи
        електронния магазин като гости.
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 space-y-4"
      >
        <FormControl fullWidth variant="outlined" required>
          <InputLabel htmlFor="firstName">Име</InputLabel>
          <OutlinedInput
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            label="Име"
            inputProps={{ maxLength: 50 }}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined" required>
          <InputLabel htmlFor="lastName">Фамилия</InputLabel>
          <OutlinedInput
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            label="Фамилия"
            inputProps={{ maxLength: 50 }}
          />
        </FormControl>
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
        <FormControl fullWidth variant="outlined" required className="mt-4">
          <InputLabel htmlFor="confirmPassword">Потвърдете паролата</InputLabel>
          <OutlinedInput
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Потвърдете паролата"
            inputProps={{ maxLength: 255 }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="city">Град</InputLabel>
          <OutlinedInput
            id="city"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            label="Град"
            inputProps={{ maxLength: 100 }}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="address">Адрес</InputLabel>
          <OutlinedInput
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            label="Адрес"
            inputProps={{ maxLength: 255 }}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="phone">Телефон</InputLabel>
          <OutlinedInput
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,20}$/.test(value)) {
                setPhone(value);
              }
            }}
            label="Телефон"
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
          {loading ? "Регистрация..." : "Регистрирай се"}
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
