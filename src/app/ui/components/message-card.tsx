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
      className="bg-white text-center shadow-lg rounded-lg p-4 sm:p-6 w-full mx-auto transform transition-transform hover:scale-105 hover:shadow-2xl"
    >
      <div className="flex flex-col gap-3 sm:gap-5">
        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 whitespace-normal break-words">
          {message.title}
        </h3>

        {/* Name */}
        <p className="text-gray-600 text-base sm:text-lg whitespace-normal break-words">
          <strong>Име:</strong> {message.name}
        </p>

        {/* Email */}
        <p className="text-gray-600 text-base sm:text-lg whitespace-normal break-words">
          <strong>Email:</strong> {message.email}
        </p>

        {/* Content */}
        <p className="text-gray-700 text-base sm:text-lg whitespace-normal break-words">
          {message.content}
        </p>

        {/* Date */}
        <p className="text-gray-500 text-base sm:text-lg">
          {formatDate(message.createdAt)}
        </p>

        {/* Delete Button */}
        <div className="flex justify-center">
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
