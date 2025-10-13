import axios from "axios";
import { Message as MessagePrisma } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import type { Message } from "@/lib/types/interfaces";

export const sendMessage = async (
  formData: Message & { captchaToken: string }
) => {
  try {
    const response = await axios.post("/api/public/messages", formData);
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    const axiosError = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    } else if (axiosError.message === "Възникна мрежова грешка!") {
      throw new Error(
        "Възникна грешка при връзка със сървъра! Моля, опитайте отново по-късно!"
      );
    } else {
      throw new Error("Възникна грешка при изпращане на съобщението!");
    }
  }
};

export const fetchMessages = async (): Promise<MessagePrisma[]> => {
  try {
    const response = await axios.get("/api/dashboard/messages");
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на съобщенията!");
  }
};

export const deleteMessage = async (id: string) => {
  try {
    const response = await axios.delete(`/api/dashboard/messages/${id}`);
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при изтриване на съобщението!");
  }
};
