import { Button } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import { Message } from "@prisma/client";

export default function MessageCard({
  message,
  formatDate,
  onDelete,
}: {
  message: Message;
  formatDate: (date: Date) => string;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      key={message.id}
      className="bg-card-bg text-center shadow-lg rounded-lg p-4 sm:p-6 w-full mx-auto transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-card-border"
    >
      <div className="flex flex-col gap-3 sm:gap-5">
        <h3 className="text-xl sm:text-2xl font-semibold text-text-primary whitespace-normal break-words">
          {message.title}
        </h3>
        <p className="text-text-secondary text-base sm:text-lg whitespace-normal break-words">
          <strong>Име:</strong> {message.name}
        </p>
        <p className="text-text-secondary text-base sm:text-lg whitespace-normal break-words">
          <strong>Email:</strong> {message.email}
        </p>
        <p className="text-text-primary text-base sm:text-lg whitespace-normal break-words">
          {message.content}
        </p>
        <p className="text-text-muted text-base sm:text-lg">
          {formatDate(message.createdAt)}
        </p>
        <div className="flex justify-center dashboard-primary-nav">
          <Button
            variant="contained"
            color="error"
            sx={{
              display: "flex",
              width: "8rem",
              gap: "0.5rem",
              fontWeight: "bold",
            }}
            onClick={() => onDelete(message.id)}
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </div>
    </div>
  );
}
