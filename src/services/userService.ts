import axios from "axios";
import { UserData, Customer } from "@/lib/types/interfaces";
import jwt from "jsonwebtoken";
import * as Sentry from "@sentry/nextjs";

const getBaseUrl = () => {
  return (
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
};

export const fetchUserData = async (token: string) => {
  try {
    const { data } = await axios.get("/api/public/users/update-account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при извличане на данните!");
  }
};

export const updateUserData = async ({
  token,
  userData,
}: {
  token: string;
  userData: UserData;
}) => {
  try {
    const { data } = await axios.put(
      "/api/public/users/update-account",
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new Error("Потребител с този имейл вече съществува!");
    }
    throw new Error("Възникна грешка при обновяване на данните!");
  }
};

export const changePassword = async (formData: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const userData = localStorage.getItem("userData");
    const parsedUserData = userData ? JSON.parse(userData) : null;
    const token = parsedUserData?.token || "";

    const { data } = await axios.post(
      "/api/public/users/change-password",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    const message = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    throw new Error(message || "Възникна грешка при смяна на паролата!");
  }
};

export const deleteAccount = async (userId: string) => {
  try {
    await axios.delete(`/api/public/users/delete-account/${userId}`);
    return userId;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при изтриване на акаунта!");
  }
};

export const signUp = async (formData: Customer & { captchaToken: string }) => {
  try {
    const response = await axios.post("/api/public/users/sign-up", formData, {
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status < 500,
    });

    if (response.status >= 400) {
      throw new Error(
        response.data?.message || "Възникна грешка при регистрация!"
      );
    }

    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Възникна грешка при регистрация на акаунта!");
  }
};

export const signIn = async (formData: {
  email: string;
  password: string;
  captchaToken: string;
}) => {
  try {
    const { data } = await axios.post("/api/public/users/sign-in", formData, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
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

    if (axiosError.response?.status === 401) {
      throw new Error("Грешен имейл или парола!");
    } else if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    } else if (axiosError.message === "Възникна мрежова грешка!") {
      throw new Error(
        "Грешка при връзка със сървъра. Моля, опитайте отново по-късно."
      );
    } else {
      throw new Error("Възникна грешка при влизане в акаунта!");
    }
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const { data } = await axios.get(
      `/api/public/users/verify-email?token=${token}`
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при верификация на имейла!");
  }
};

export const resendVerificationEmail = async (token: string) => {
  try {
    const decoded = jwt.decode(token) as { email?: string };
    if (!decoded?.email) {
      throw new Error("Невалиден токен! Моля, влезте отново в акаунта си!");
    }

    const { data } = await axios.post(
      "/api/public/users/resend-verification",
      { email: decoded.email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("Възникна грешка при изпращане на имейла за верификация!");
  }
};

export const getVerificationLink = (token: string) => {
  return `${getBaseUrl()}/user/verify-email?token=${token}`;
};

export const forgotPassword = async (formData: {
  email: string;
  captchaToken: string;
}) => {
  try {
    const { data } = await axios.post(
      "/api/public/users/forgot-password",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    const message = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    throw new Error(
      message || "Възникна грешка при изпращане на имейла за смяна на паролата!"
    );
  }
};

export const resetPassword = async (formData: {
  token: string;
  newPassword: string;
}) => {
  try {
    const { data } = await axios.post(
      "/api/public/users/reset-password",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    const message = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    throw new Error(message || "Възникна грешка при смяна на паролата!");
  }
};

export const googleOAuthSignIn = async (email: string) => {
  try {
    const { data } = await axios.post(
      "/api/public/users/oauth-sign-in",
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    Sentry.captureException(error);
    const message = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    throw new Error(message || "Възникна грешка при влизане с Google акаунт!");
  }
};
