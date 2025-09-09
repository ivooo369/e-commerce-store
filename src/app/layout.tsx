import { Inter } from "next/font/google";
import MainLayout from "@/ui/layouts/main-layout";
import { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";

const ScrollToTop = dynamic(() => import("@/ui/components/scroll-to-top"), {
  ssr: false,
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

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
      <body
        className={`${inter.className} min-h-screen bg-bg-primary text-text-primary`}
      >
        <MainLayout>{children}</MainLayout>
        <ScrollToTop />
      </body>
    </html>
  );
}
