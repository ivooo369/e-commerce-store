"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/store/slices/userSlice";

export default function AuthInitialize() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");

      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.token) {
            dispatch(
              setUser({
                id: parsedUserData.id,
                firstName: parsedUserData.firstName,
                lastName: parsedUserData.lastName,
                token: parsedUserData.token,
                isLoggedIn: true,
              })
            );
          }
        } catch {
          localStorage.removeItem("userData");
        }
      }
    }
  }, [dispatch]);

  return null;
}
