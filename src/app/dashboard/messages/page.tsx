"use client";

import MessageCard from "@/app/ui/components/message-card";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  name: string;
  email: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function DashboardMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, []);

  const handleDeleteMessage = (id: string) => {
    // Remove the message from the state based on the id
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== id)
    );
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} г. (${hours}:${minutes} ч.)`;
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide">
          Съобщения
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              formatDate={formatMessageDate}
              onDelete={handleDeleteMessage} // Pass the delete handler
            />
          ))}
        </div>
      </div>
    </>
  );
}
