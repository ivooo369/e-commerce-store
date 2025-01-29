"use client";

import { SessionProvider } from "next-auth/react";
import { store } from "@/app/lib/store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
          <MainLayoutContent>{children}</MainLayoutContent>
        </QueryClientProvider>
      </SessionProvider>
    </Provider>
  );
}
