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
          className="flex items-center justify-center p-8 bg-white rounded-lg shadow-md"
          sx={{
            boxShadow: 24,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <CircularProgress message={deletingMessage || "Изтриване..."} />
        </Box>
      ) : (
        <Box
          className="flex flex-col items-center justify-center p-8 shadow-lg bg-white max-w-xl mx-auto"
          sx={{
            border: "5px solid #d32f2f",
            boxShadow: 24,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex items-center mb-4 text-red-600">
            <WarningIcon className="mr-2" fontSize="large" />
            <Typography
              variant="h5"
              component="h2"
              className="font-semibold text-center text-lg md:text-xl lg:text-2xl font-bold"
            >
              Внимание!
            </Typography>
          </div>
          <Typography
            variant="h6"
            className="text-center mb-4 text-base md:text-lg lg:text-xl font-bold"
          >
            {mainMessage}
          </Typography>
          <div className="mt-4 flex justify-between w-full">
            <Button
              variant="contained"
              color="error"
              onClick={onConfirm}
              className="flex-1 mr-2 font-bold gap-1.5"
            >
              <FaTrash /> Изтрий
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
              className="flex-1 ml-2 font-bold"
            >
              Отказ
            </Button>
          </div>
        </Box>
      )}
    </Modal>
  );
}
