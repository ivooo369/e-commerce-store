"use client";

import { SessionProvider } from "next-auth/react";
import { store } from "@/lib/store/store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme/themeContext";
import MainLayoutContent from "./main-layout-content";
import dynamic from "next/dynamic";

const AuthInitializer = dynamic(
  () => import("@/ui/components/others/auth-initializer"),
  {
    ssr: false,
  }
);

const queryClient = new QueryClient();

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <>
              <AuthInitializer />
              <MainLayoutContent>{children}</MainLayoutContent>
            </>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Provider>
  );
}
