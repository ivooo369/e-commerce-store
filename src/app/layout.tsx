import MainLayout from "@/ui/layouts/main-layout";
import { Metadata } from "next";
import "./globals.css";

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
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
