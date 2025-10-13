import { Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import type { AlertMessageProps } from "@/lib/types/interfaces";

export default function AlertMessage({ severity, message }: AlertMessageProps) {
  let icon;
  if (severity === "success") {
    icon = <CheckIcon fontSize="inherit" />;
  } else if (severity === "error") {
    icon = <ErrorIcon fontSize="inherit" />;
  }

  return (
    <Alert
      variant="filled"
      severity={severity}
      icon={icon}
      className="flex justify-center gap-2 font-bold"
    >
      {message}
    </Alert>
  );
}
