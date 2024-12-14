import { Alert } from "@mui/material";

interface AlertMessageProps {
  severity: "success" | "error";
  message: string;
}

export default function AlertMessage({ severity, message }: AlertMessageProps) {
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
}
