import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/userSlice";
import { usePathname } from "next/navigation";
import Header from "../layouts/header";
import Footer from "../layouts/footer";
import { useQuery } from "@tanstack/react-query";
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

  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (userData) {
      dispatch(setUser(userData));
    }
  }, [userData, dispatch]);

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
