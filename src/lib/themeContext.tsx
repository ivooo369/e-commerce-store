"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeContextType } from "./interfaces";

export type Theme = "light" | "dark";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to safely access localStorage
const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;
  const storedTheme = localStorage.getItem("theme") as Theme;
  return storedTheme || null;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with a default theme that will be updated in useEffect
  const [theme, setTheme] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState(false);

  // Only run on the client side after component mounts
  useEffect(() => {
    setIsMounted(true);

    // Get the saved theme from localStorage if it exists
    const savedTheme = getStoredTheme();

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // If no saved theme, check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
    }

    // Listen for theme changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        const newTheme = e.newValue as Theme;
        setTheme(newTheme);
      }
    };

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only change if user hasn't explicitly set a preference
      if (!getStoredTheme()) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  // Update the document class and localStorage when theme changes
  useEffect(() => {
    if (!isMounted) return;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

    // Only update localStorage if we're on the client side
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme, isMounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
