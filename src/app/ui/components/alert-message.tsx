import React from "react";
import { Alert } from "@mui/material";

interface AlertMessageProps {
  severity: "success" | "error";
  message: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ severity, message }) => {
  return (
    <Alert
      variant="filled"
      severity={severity}
      sx={{ marginBottom: "1rem" }}
      className="justify-center gap-1 text-base m-0 font-bold"
    >
      {message}
    </Alert>
  );
};

export default AlertMessage;
