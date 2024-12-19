import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import WarningIcon from "@mui/icons-material/Warning";
import { FaTrash } from "react-icons/fa";
import CircularProgress from "@/app/ui/components/circular-progress";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mainMessage: string;
  deletingMessage?: string;
  isDeleting?: boolean;
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  mainMessage,
  deletingMessage,
  isDeleting = false,
}: ConfirmationModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
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
            backgroundColor: "white",
            borderRadius: "0.5rem",
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
            border: "5px solid #d32f2f",
            boxShadow: 24,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
          }}
        >
          <div className="flex items-center mb-4 text-red-600">
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
                flex: 1,
                marginRight: "0.5rem",
                fontWeight: "bold",
                gap: "0.375rem",
              }}
            >
              <FaTrash /> Изтрий
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                flex: 1,
                marginLeft: "0.5rem",
                fontWeight: "bold",
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
