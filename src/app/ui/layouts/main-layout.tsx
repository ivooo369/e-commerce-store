"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  const showHeaderFooter = !isDashboard && !isAdmin;

  return (
    <>
      {showHeaderFooter && <Header />}
      <main>{children}</main>
      {showHeaderFooter && <Footer />}
    </>
  );
}
