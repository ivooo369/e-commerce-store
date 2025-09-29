import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import WarningIcon from "@mui/icons-material/Warning";
import { FaTrash } from "react-icons/fa";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import { ConfirmationModalProps } from "@/lib/types/interfaces";

export default function ConfirmationModal({
  open,
  onCancel,
  onConfirm,
  message,
  title = "Внимание!",
  isDeleting = false,
  deletingMessage = "Изтриване...",
}: ConfirmationModalProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      {isDeleting ? (
        <Box className="flex flex-col shadow-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-8 bg-[var(--card-bg)] rounded-lg text-[var(--text-primary)]">
          <CircularProgress message={deletingMessage} />
        </Box>
      ) : (
        <Box className="flex flex-col justify-center items-center p-8 border-[5px] border-[var(--error-color)] shadow-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--card-bg)] text-[var(--text-primary)]">
          <div className="flex items-center mb-4 text-error-color">
            <WarningIcon className="mr-2" fontSize="large" />
            <Typography
              variant="h5"
              component="h2"
              className="font-bold text-center text-lg md:text-xl lg:text-2xl"
            >
              {title}
            </Typography>
          </div>
          <Typography
            variant="h6"
            className="text-center mb-4 text-base font-bold md:text-lg lg:text-xl"
          >
            {message}
          </Typography>
          <div className="flex justify-between w-full">
            <Button
              variant="contained"
              onClick={onCancel}
              className="flex flex-1 font-bold w-32 bg-blue-500 hover:bg-blue-600 text-white mr-3"
            >
              Отказ
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={onConfirm}
              className="flex flex-1 font-bold w-32 gap-1.5 bg-red-500 hover:bg-red-600"
            >
              <FaTrash /> Изтрий
            </Button>
          </div>
        </Box>
      )}
    </Modal>
  );
}
