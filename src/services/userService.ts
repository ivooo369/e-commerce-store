import axios from "axios";
import { UserData, Customer } from "@/lib/interfaces";
import { handleError } from "@/lib/handleError";
import jwt from "jsonwebtoken";

export const fetchUserData = async (token: string) => {
  try {
    const { data } = await axios.get("/api/public/users/update-account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    throw new Error(handleError(error));
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
    throw new Error(handleError(error));
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
    throw new Error(handleError(error));
  }
};

export const deleteAccount = async (userId: string) => {
  try {
    await axios.delete(`/api/public/users/delete-account/${userId}`);
    return userId;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const signUp = async (formData: Customer) => {
  try {
    const { data } = await axios.post("/api/public/users/sign-up", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const signIn = async (formData: { email: string; password: string }) => {
  try {
    const { data } = await axios.post("/api/public/users/sign-in", formData, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const { data } = await axios.get(
      `/api/public/users/verify-email?token=${token}`
    );
    return data;
  } catch (error) {
    throw new Error(handleError(error));
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
    throw new Error(handleError(error));
  }
};
