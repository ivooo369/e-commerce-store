"use client";

import { SessionProvider } from "next-auth/react";
import { store } from "@/lib/store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/themeContext";
import MainLayoutContent from "../components/main-layout-content";

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
            <MainLayoutContent>{children}</MainLayoutContent>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Provider>
  );
}
