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

export default function DashboardLoginPage() {
  const [customerUsername, setCustomerUsername] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      username: customerUsername,
      password: customerPassword,
    });

    if (result?.error) {
      setError("Невалидно потребителско име или парола");
    } else {
      router.push("/dashboard/products");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-200">
      <div className="bg-white p-9 rounded-lg shadow-2xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-7">
          Администраторски Панел - Вход
        </h1>
        <form className="space-y-7" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            id="email-input"
            label="Потребителско име"
            value={customerUsername}
            onChange={(e) => setCustomerUsername(e.target.value)}
          />
          <FormControl variant="outlined" required fullWidth>
            <InputLabel htmlFor="outlined-password-input">Парола</InputLabel>
            <OutlinedInput
              id="outlined-password-input"
              type={showPassword ? "text" : "password"}
              value={customerPassword}
              onChange={(e) => setCustomerPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Превключване на видимостта на паролата"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{
                      transition: "background-color 0.3s ease",
                      marginRight: "1px",
                      "&:hover": {
                        backgroundColor: "#DCDCDC",
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Парола"
            />
          </FormControl>
          {error && <p className="text-red-500 text-center">{error}</p>}{" "}
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
          >
            ВХОД
          </button>
        </form>
      </div>
    </div>
  );
}
