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

// This script will run before the page is interactive to prevent theme flash
const themeScript = `
  (function() {
    // Get the theme from localStorage or system preference
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
    // Set the theme class immediately
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
        {/* Add the theme script before any content is rendered */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
