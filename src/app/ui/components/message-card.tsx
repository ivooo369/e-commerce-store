import { Button } from "@mui/material";
import { FaTrash } from "react-icons/fa";

// Define the type for the message object
interface Message {
  id: string;
  name: string;
  email: string;
  title: string;
  content: string;
  createdAt: string;
}

// Define the type for the formatDate function
interface MessageCardProps {
  message: Message;
  formatDate: (dateString: string) => string;
  onDelete: (id: string) => void; // Add a callback prop for handling delete
}

export default function MessageCard({
  message,
  formatDate,
  onDelete,
}: MessageCardProps) {
  const handleDelete = async () => {
    try {
      const response = await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: message.id }),
      });

      if (response.ok) {
        onDelete(message.id); // Notify the parent component to remove the message
      } else {
        console.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message", error);
    }
  };

  return (
    <div
      key={message.id}
      className="bg-white text-center shadow-lg rounded-lg p-6 w-9/12 mx-auto transform transition-transform hover:scale-105 hover:shadow-2xl"
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-3xl font-semibold text-gray-800">
          {message.title}
        </h3>

        <p className="text-gray-600 text-base">
          <strong>Име:</strong> {message.name}
        </p>
        <p className="text-gray-600 text-base">
          <strong>Email:</strong> {message.email}
        </p>

        <p className="text-gray-700 text-lg whitespace-normal break-words">
          {message.content}
        </p>

        <p className="text-gray-500 text-base">
          {formatDate(message.createdAt)}
        </p>

        <div className="flex justify-center">
          <Button
            variant="contained"
            color="error"
            className="w-32 flex justify-center items-center gap-2 font-medium py-2"
            onClick={handleDelete} // Handle delete
          >
            <FaTrash /> Изтрий
          </Button>
        </div>
      </div>
    </div>
  );
}
