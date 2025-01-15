"use client";

import MessageCard from "@/app/ui/components/message-card";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@/app/ui/components/circular-progress";
import ConfirmationModal from "@/app/ui/components/confirmation-modal";
import { Message } from "@prisma/client";

export default function DashboardMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/dashboard/messages");
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error("Възникна грешка при извличане на съобщенията!");
        }
      } catch (error) {
        console.error("Възникна грешка при извличане на съобщенията:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleOpenModal = (id: string) => {
    setMessageToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMessageToDelete(null);
  };

  const handleDeleteMessage = async () => {
    if (messageToDelete) {
      setIsDeleting(true);
      try {
        const response = await fetch(
          `/api/dashboard/messages/${messageToDelete}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok)
          throw new Error("Възникна грешка при изтриване на съобщението!");

        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.id !== messageToDelete)
        );
      } catch (error) {
        console.error("Възникна грешка при изтриване на съобщението:", error);
      } finally {
        setIsDeleting(false);
        handleCloseModal();
      }
    }
  };

  const formatMessageDate = (date: Date | string) => {
    const validDate = new Date(date);
    const day = String(validDate.getDate()).padStart(2, "0");
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const year = validDate.getFullYear();
    const hours = String(validDate.getHours()).padStart(2, "0");
    const minutes = String(validDate.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} г. (${hours}:${minutes} ч.)`;
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-wide">
          Съобщения
        </h1>
        {isLoading ? (
          <Box className="flex justify-center items-center py-10">
            <CircularProgress message="Зареждане на съобщенията..." />
          </Box>
        ) : messages.length === 0 ? (
          <div className="container mx-auto px-4 mt-4 font-bold">
            <p className="text-center text-2xl p-16 bg-white rounded-md text-gray-600">
              Няма налични съобщения
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                formatDate={formatMessageDate}
                onDelete={handleOpenModal}
              />
            ))}
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteMessage}
        mainMessage="Сигурни ли сте, че искате да изтриете това съобщение?"
        deletingMessage="Изтриване на съобщението..."
        isDeleting={isDeleting}
      />
    </>
  );
}
