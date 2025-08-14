import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import WarningIcon from "@mui/icons-material/Warning";
import { FaTrash } from "react-icons/fa";
import CircularProgress from "@/ui/components/circular-progress";
import { ConfirmationModalProps } from "@/lib/interfaces";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  mainMessage,
  deletingMessage,
  isDeleting = false,
}: ConfirmationModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      {isDeleting ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            boxShadow: 24,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            padding: 8,
            backgroundColor: "var(--card-bg)",
            borderRadius: "0.5rem",
            color: "var(--text-primary)",
          }}
        >
          <CircularProgress message={deletingMessage || "Изтриване..."} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 4,
            border: "5px solid var(--error-color)",
            boxShadow: 24,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "var(--card-bg)",
            color: "var(--text-primary)",
          }}
        >
          <div className="flex items-center mb-4 text-error-color">
            <WarningIcon className="mr-2" fontSize="large" />
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                fontSize: "1.125rem",
                "@media (min-width: 768px)": {
                  fontSize: "1.25rem",
                },
                "@media (min-width: 1024px)": {
                  fontSize: "1.5rem",
                },
              }}
            >
              Внимание!
            </Typography>
          </div>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              marginBottom: "1rem",
              fontSize: "1rem",
              fontWeight: "bold",
              "@media (min-width: 768px)": {
                fontSize: "1.125rem",
              },
              "@media (min-width: 1024px)": {
                fontSize: "1.25rem",
              },
            }}
          >
            {mainMessage}
          </Typography>
          <div className="mt-4 flex justify-between w-full">
            <Button
              variant="contained"
              color="error"
              onClick={onConfirm}
              sx={{
                display: "flex",
                flex: 1,
                fontWeight: "bold",
                width: "8rem",
                gap: "0.375rem",
                backgroundColor: "#ef4444",
                "&:hover": {
                  backgroundColor: "#dc2626",
                },
              }}
            >
              <FaTrash /> Изтрий
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                display: "flex",
                flex: 1,
                fontWeight: "bold",
                width: "8rem",
                backgroundColor: "#3b82f6",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
                color: "white",
                marginLeft: "0.5rem",
              }}
            >
              Отказ
            </Button>
          </div>
        </Box>
      )}
    </Modal>
  );
}
