import axios from "axios";
import { Message } from "@/lib/types/interfaces";
import { Message as MessagePrisma } from "@prisma/client";

export const sendMessage = async (formData: Message) => {
  try {
    const response = await axios.post("/api/public/messages", formData);
    return response.data;
  } catch {
    throw new Error("Възникна грешка при изпращане на съобщението!");
  }
};

export const fetchMessages = async (): Promise<MessagePrisma[]> => {
  try {
    const response = await axios.get("/api/dashboard/messages");
    return response.data;
  } catch {
    throw new Error("Възникна грешка при извличане на съобщенията!");
  }
};

export const deleteMessage = async (id: string) => {
  try {
    await axios.delete(`/api/dashboard/messages/${id}`);
  } catch {
    throw new Error("Възникна грешка при изтриване на съобщението!");
  }
};
