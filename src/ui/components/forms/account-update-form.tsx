"use client";

import { FormControl, InputLabel, OutlinedInput, Button } from "@mui/material";
import AlertMessage from "@/ui/components/feedback/alert-message";
import { AccountUpdateFormProps } from "@/lib/types/interfaces";
import { useEffect } from "react";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";

export function AccountUpdateForm({
  formState: { firstName, lastName, email, city, address, phone },
  isUpdating,
  alert: propAlert,
  onInputChange,
  onSubmit,
}: AccountUpdateFormProps) {
  const [localAlert, setLocalAlert] = useAutoDismissAlert(5000);

  useEffect(() => {
    if (propAlert) {
      setLocalAlert(propAlert);
    }
  }, [propAlert, setLocalAlert]);

  return (
    <form
      onSubmit={onSubmit}
      className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
    >
      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="firstName">Име</InputLabel>
        <OutlinedInput
          id="firstName"
          name="firstName"
          value={firstName}
          onChange={onInputChange}
          label="Име"
          inputProps={{ maxLength: 50, autoComplete: "given-name" }}
        />
      </FormControl>

      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="lastName">Фамилия</InputLabel>
        <OutlinedInput
          id="lastName"
          name="lastName"
          value={lastName}
          onChange={onInputChange}
          label="Фамилия"
          inputProps={{ maxLength: 50, autoComplete: "family-name" }}
        />
      </FormControl>

      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="email">E-mail</InputLabel>
        <OutlinedInput
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={onInputChange}
          label="E-mail"
          inputProps={{
            maxLength: 255,
            autoComplete: "email",
            readOnly: true,
          }}
          disabled
        />
      </FormControl>

      <FormControl fullWidth variant="outlined">
        <InputLabel htmlFor="city">Населено място</InputLabel>
        <OutlinedInput
          id="city"
          name="city"
          value={city}
          onChange={onInputChange}
          label="Населено място"
          inputProps={{ maxLength: 100, autoComplete: "address-level2" }}
        />
      </FormControl>

      <FormControl fullWidth variant="outlined">
        <InputLabel htmlFor="address">Адрес</InputLabel>
        <OutlinedInput
          id="address"
          name="address"
          value={address}
          onChange={onInputChange}
          label="Адрес"
          inputProps={{ maxLength: 255, autoComplete: "street-address" }}
        />
      </FormControl>

      <FormControl fullWidth variant="outlined">
        <InputLabel htmlFor="phone">Телефон</InputLabel>
        <OutlinedInput
          id="phone"
          name="phone"
          value={phone}
          onChange={onInputChange}
          label="Телефон"
          inputProps={{ maxLength: 20, autoComplete: "tel" }}
        />
      </FormControl>

      <Button
        variant="contained"
        className="font-bold"
        color="primary"
        type="submit"
        disabled={isUpdating}
        fullWidth
      >
        {isUpdating ? "Обновяване..." : "Обнови акаунта"}
      </Button>

      {localAlert && (
        <AlertMessage
          severity={localAlert.severity}
          message={localAlert.message}
        />
      )}
    </form>
  );
}
