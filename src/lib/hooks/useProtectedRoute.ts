"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export default function useProtectedRoute() {
  const router = useRouter();
  const { token: reduxToken, isLoggedIn } = useSelector(
    (state: RootState) => state.user
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isInitialized) return;

    const checkAuth = () => {
      const userData = localStorage.getItem("userData");
      const hasValidReduxAuth = reduxToken && isLoggedIn;
      const hasValidLocalAuth = userData && JSON.parse(userData)?.token;

      if (!hasValidReduxAuth && !hasValidLocalAuth) {
        router.push("/user/sign-in");
        return false;
      }
      return true;
    };

    const isAuthenticated = checkAuth();
    if (!isAuthenticated) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userData") {
        if (!e.newValue) {
          router.push("/user/sign-in");
        } else if (!reduxToken) {
          window.location.reload();
        }
      }
    };

    checkAuth();

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [reduxToken, isLoggedIn, router, isInitialized]);

  return { token: reduxToken, isLoggedIn };
}
