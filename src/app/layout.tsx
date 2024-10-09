import MainLayout from "./layouts/main-layout";
import "./globals.css";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | LIPCI Design Studio",
    default: "LIPCI Design Studio",
  },
  description: "Online store offering different categories of products",
  icons: {
    icon: "/assets/images/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}