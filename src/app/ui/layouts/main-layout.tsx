"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import { SessionProvider } from "next-auth/react";
import { store } from "@/app/lib/store";
import { Provider } from "react-redux";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isVerifyEmail = pathname === "/user/verify-email";

  const showHeaderFooter = !isDashboard && !isAdmin && !isVerifyEmail;

  return (
    <Provider store={store}>
      <SessionProvider>
        <div className="flex flex-col min-h-screen">
          {showHeaderFooter && <Header />}
          <main className="flex-grow">{children}</main>
          {showHeaderFooter && <Footer />}
        </div>
      </SessionProvider>
    </Provider>
  );
}
