"use client";

import { useState } from "react";
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
import { setUser } from "@/app/lib/userSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { FiCheck } from "react-icons/fi";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const formData = { email, password };

    try {
      const response = await fetch("/api/users/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      localStorage.setItem(
        "userData",
        JSON.stringify({
          token: responseData.token,
          firstName: responseData.user.firstName,
          lastName: responseData.user.lastName,
        })
      );

      dispatch(
        setUser({
          firstName: responseData.user.firstName,
          lastName: responseData.user.lastName,
          authToken: responseData.token,
        })
      );

      setAlert({
        message: responseData.message,
        severity: "success",
      });
      setLoading(false);
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
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-wide">
        Вход в потребителски акаунт
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-4 sm:p-6 space-y-4"
      >
        <div>
          <h3 className="font-semibold text-lg sm:text-xl text-center text-gray-600 mb-3">
            Когато сте влезли в своя акаунт, имате възможност:
          </h3>
          <ul className="space-y-2 text-gray-600 text-base sm:text-lg m-auto w-2/4">
            <li className="flex items-center gap-4">
              <FiCheck className="text-green-500 flex-shrink-0" size={35} />
              <span className="leading-6">
                Да преглеждате историята на всички поръчки, които сте направили
              </span>
            </li>
            <li className="flex items-center gap-4">
              <FiCheck className="text-green-500 flex-shrink-0" size={35} />
              <span className="leading-6">
                Да се възползвате от специални промоции
              </span>
            </li>
            <li className="flex items-center gap-4">
              <FiCheck className="text-green-500 flex-shrink-0" size={35} />
              <span className="leading-6">
                Да запазвате продукти, които са Ви харесали в &quot;Любими&quot;
              </span>
            </li>
          </ul>
        </div>
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
            type={showPassword ? "text" : "password"}
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
          {loading ? "Влизане..." : "Влез в акаунта си"}
        </Button>
        {alert && (
          <div>
            <AlertMessage severity={alert.severity} message={alert.message} />
          </div>
        )}
        <div className="flex justify-center gap-5 sm:gap-8 mt-4">
          <p className="flex text-center flex-col lg:flex-row text-base sm:text-lg">
            Нямате акаунт?
            <Link
              href="/user/sign-up"
              className="text-blue-600 hover:underline lg:ml-2"
            >
              Регистрирайте се тук
            </Link>
          </p>
          <p>|</p>
          <p className="flex text-center flex-col lg:flex-row text-base sm:text-lg">
            Забравена парола?
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline lg:ml-2"
            >
              Създайте нова парола
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
