import { ClearCartConfirmationModalProps } from "@/lib/types/interfaces";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function ClearCartConfirmationModalContent({
  open,
  onConfirm,
  onCancel,
}: ClearCartConfirmationModalProps) {
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
        Изчистване на количката
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Сигурни ли сте, че искате да изчистите всички продукти от количката?
        </DialogContentText>
      </DialogContent>
      <DialogActions className="p-4 flex justify-end gap-2 [&>.MuiButton-root]:m-0">
        <Button
          onClick={onCancel}
          variant="contained"
          className="font-bold bg-blue-500 hover:bg-blue-600 text-white"
        >
          Откажи
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          className="font-bold bg-red-500 hover:bg-red-600 text-white"
          autoFocus
        >
          Изчисти количката
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ClearCartConfirmationModal(
  props: ClearCartConfirmationModalProps
) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <ClearCartConfirmationModalContent {...props} />,
    document.body
  );
}
