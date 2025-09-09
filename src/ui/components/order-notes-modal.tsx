"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface OrderNotesModalProps {
  open: boolean;
  onClose: () => void;
  notes?: string | null;
}

export default function OrderNotesModal({
  open,
  onClose,
  notes,
}: OrderNotesModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="order-notes-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle 
        id="order-notes-dialog-title" 
        className="font-bold border-b border-gray-200 dark:border-gray-700"
      >
        Бележки към поръчката
      </DialogTitle>
      <DialogContent className="p-0">
        <div className="p-6">
          {notes?.trim() ? (
            <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {notes}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Няма добавени бележки към тази поръчка.
            </p>
          )}
        </div>
        <div className="px-6 pb-4 flex justify-end gap-2">
          <Button
            onClick={onClose}
            variant="contained"
            className="font-bold bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-white"
          >
            Затвори
          </Button>
        </div>
      </DialogContent>
    </Dialog>,
    document.body
  );
}
