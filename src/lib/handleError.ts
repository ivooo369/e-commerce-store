import axios, { AxiosError } from "axios";

export const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return (
      axiosError.response?.data?.message ||
      "Възникна грешка при обработката на заявката."
    );
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return "Неизвестна грешка.";
  }
};
