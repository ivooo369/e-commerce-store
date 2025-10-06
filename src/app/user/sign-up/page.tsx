"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import AlertMessage from "@/ui/components/feedback/alert-message";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/store/slices/userSlice";
import Link from "next/link";
import AccountBenefits from "@/ui/components/others/account-benefits";
import { Checkbox, FormControlLabel } from "@mui/material";
import { signUp } from "@/services/userService";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";

export default function SignUpPage() {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [signingUp, setIsSigningUp] = useState(false);
  const [areTermsAccepted, setAreTermsAccepted] = useState(false);
  const [alert, setAlert] = useAutoDismissAlert();

  const handleClickShowPassword = () => setIsPasswordVisible((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setIsConfirmPasswordVisible((show) => !show);

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const mutation = useMutation({
    mutationFn: signUp,
    onMutate: () => {
      setIsSigningUp(true);
    },
    onSuccess: (responseData) => {
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

      setAlert({
        message: responseData.message,
        severity: "success",
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCity("");
      setAddress("");
      setPhone("");
      setIsSigningUp(false);
    },
    onError: (error: Error) => {
      setAlert({
        message: error.message || "Възникна грешка при регистрацията!",
        severity: "error",
      });
      setIsSigningUp(false);
    },
  });

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      setAlert({
        message: "Паролата трябва да е поне 8 символа!",
        severity: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({
        message: "Новата парола и паролата за потвърждение не съвпадат!",
        severity: "error",
      });
      return;
    }

    const formData = {
      firstName,
      lastName,
      email,
      password,
      city,
      address,
      phone,
    };

    mutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 tracking-wide text-text-primary">
        Регистрация на нов потребителски акаунт
      </h1>
      <form
        onSubmit={handleSignUp}
        className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
      >
        <AccountBenefits />
        <FormControl fullWidth variant="outlined" required>
          <InputLabel htmlFor="firstName">Име</InputLabel>
          <OutlinedInput
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            label="Име"
            inputProps={{ maxLength: 50, autoComplete: "first name" }}
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
            inputProps={{ maxLength: 50, autoComplete: "last name" }}
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
            inputProps={{ maxLength: 255, autoComplete: "password" }}
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
        <FormControl fullWidth variant="outlined" required className="mt-4">
          <InputLabel htmlFor="confirmPassword">Потвърдете паролата</InputLabel>
          <OutlinedInput
            id="confirmPassword"
            type={isConfirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Потвърдете паролата"
            inputProps={{ maxLength: 255, autoComplete: "confirm password" }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowConfirmPassword}
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
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="location">Населено място</InputLabel>
          <OutlinedInput
            id="location"
            name="location"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            label="Населено място"
            inputProps={{ maxLength: 100, autoComplete: "city" }}
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
            inputProps={{ maxLength: 255, autoComplete: "address" }}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="phone">Телефон</InputLabel>
          <OutlinedInput
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            label="Телефон"
            inputProps={{ maxLength: 20, autoComplete: "phone" }}
          />
        </FormControl>
        <div className="flex justify-center">
          <FormControlLabel
            className="m-0"
            control={
              <Checkbox
                checked={areTermsAccepted}
                onChange={(event) => {
                  const checkbox = event.target as HTMLInputElement;
                  setAreTermsAccepted(checkbox.checked);
                  if (checkbox.checked) {
                    checkbox.setCustomValidity("");
                  }
                }}
                color="primary"
                required
                size="medium"
                inputProps={{
                  "aria-label": "Съгласие с условията",
                }}
                onInvalid={(event) => {
                  const checkbox = event.target as HTMLInputElement;
                  checkbox.setCustomValidity(
                    "Моля, дайте съгласие за обработка на вашите данни, за да продължите."
                  );
                }}
              />
            }
            label={
              <span className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
                Съгласявам се личните ми данни да бъдат обработвани
              </span>
            }
          />
        </div>
        <Button
          className="font-bold"
          color="primary"
          variant="contained"
          type="submit"
          disabled={signingUp}
          fullWidth
        >
          {signingUp ? "Регистриране..." : "Регистрирай се"}
        </Button>
        <p className="flex justify-center items-center gap-1.5 text-base sm:text-lg font-semibold">
          Имате акаунт?
          <Link href="/user/sign-in" className="text-blue-600 hover:underline">
            Влезте тук
          </Link>
        </p>
        {alert && (
          <AlertMessage severity={alert.severity} message={alert.message} />
        )}
      </form>
    </div>
  );
}
