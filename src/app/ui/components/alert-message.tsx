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
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: "0.25rem",
        fontSize: "1rem",
        marginBottom: "1rem",
        margin: 0,
        fontWeight: "bold",
      }}
    >
      {message}
    </Alert>
  );
}
