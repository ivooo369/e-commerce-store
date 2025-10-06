"use client";

import { OrderStatusModalProps } from "@/lib/types/interfaces";
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

export default function OrderStatusModal({
  open,
  onConfirm,
  onCancel,
  isCompleted,
  orderId,
}: OrderStatusModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="order-status-dialog-title"
      aria-describedby="order-status-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="order-status-dialog-title" className="font-bold">
        {isCompleted
          ? "Маркиране като незавършена"
          : "Маркиране като завършена"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="order-status-dialog-description">
          Сигурни ли сте, че искате да маркирате поръчка
          <span className="font-medium">
            {" "}
            <strong>#{orderId?.substring(0, 8).toUpperCase()}</strong>{" "}
          </span>
          като {isCompleted ? "незавършена" : "завършена"}?
        </DialogContentText>
      </DialogContent>
      <DialogActions className="p-4 flex justify-end gap-2 [&>.MuiButton-root]:m-0">
        <Button
          onClick={onCancel}
          variant="contained"
          className="font-bold bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-white"
        >
          Откажи
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          className="font-bold text-white bg-[#0a5c3a] hover:bg-[#084b31] dark:bg-[#0a5c3a] dark:hover:bg-[#084b31]"
          autoFocus
        >
          {isCompleted
            ? "Маркирай като незавършена"
            : "Маркирай като завършена"}
        </Button>
      </DialogActions>
    </Dialog>,
    document.body
  );
}
