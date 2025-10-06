import { Inter } from "next/font/google";
import MainLayout from "@/ui/components/layouts/main-layout";
import { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import { defaultMetadata } from "@/lib/utils/metadata";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import * as Sentry from "@sentry/nextjs";

export function generateMetadata(): Metadata {
  return {
    ...defaultMetadata,
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

const ScrollToTop = dynamic(
  () => import("@/ui/components/navigation/scroll-to-top"),
  { ssr: false }
);

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const themeScript = `
  (function() {
    const getStoredTheme = () => {
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
          return storedTheme;
        }
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    
    const theme = getStoredTheme();
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <MainLayout>{children}</MainLayout>
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
