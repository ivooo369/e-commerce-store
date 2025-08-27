import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ClearCartConfirmationModal({
  open,
  title,
  message,
  confirmText = "Потвърди",
  cancelText = "Отказ",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title" className="font-bold">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions className="p-4 flex justify-end gap-2 [&>.MuiButton-root]:m-0">
        <Button 
          onClick={onCancel} 
          variant="contained"
          className="font-bold bg-blue-500 hover:bg-blue-600 text-white"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          className="font-bold bg-red-500 hover:bg-red-600 text-white"
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
