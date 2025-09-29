import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/lib/store/slices/userSlice";
import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const fetchUserData = async () => {
  const userData = localStorage.getItem("userData");
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
};

export default function MainLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dispatch = useDispatch();

  const queryClient = useQueryClient();
  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: Infinity,
  });

  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "userData") {
        queryClient.invalidateQueries({ queryKey: ["userData"] });
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [queryClient]);

  useEffect(() => {
    if (userData) {
      dispatch(setUser(userData));
    }
  }, [userData, dispatch]);

  useEffect(() => {
    function isTokenExpired(token: string) {
      if (!token) return true;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 < Date.now();
      } catch {
        return true;
      }
    }

    function autoLogoutIfTokenExpired() {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (isTokenExpired(userData.token)) {
            localStorage.removeItem("userData");
            dispatch(clearUser());
          }
        } catch {}
      }
    }

    const interval = setInterval(autoLogoutIfTokenExpired, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isVerifyEmail = pathname === "/user/verify-email";

  const showHeaderFooter = !isDashboard && !isAdmin && !isVerifyEmail;

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary transition-colors duration-300">
      {showHeaderFooter && <Header />}
      <main className="flex-grow">{children}</main>
      {showHeaderFooter && <Footer />}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </div>
  );
}
