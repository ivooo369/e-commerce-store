import { Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import { AlertMessageProps } from "@/lib/interfaces";

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
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "0.5rem",
        fontWeight: "bold",
      }}
    >
      {message}
    </Alert>
  );
}
