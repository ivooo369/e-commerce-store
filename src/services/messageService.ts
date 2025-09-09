import axios from "axios";
import { Message } from "@/lib/interfaces";
import { Message as MessagePrisma } from "@prisma/client";
import { handleError } from "@/lib/handleError";

export const sendMessage = async (formData: Message) => {
  try {
    const response = await axios.post("/api/public/messages", formData);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const fetchMessages = async (): Promise<MessagePrisma[]> => {
  try {
    const response = await axios.get("/api/dashboard/messages");
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const deleteMessage = async (id: string) => {
  try {
    await axios.delete(`/api/dashboard/messages/${id}`);
  } catch (error) {
    throw new Error(handleError(error));
  }
};
