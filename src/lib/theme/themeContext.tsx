"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeContextType } from "../types/interfaces";
import { Theme } from "../types/types";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;
  const storedTheme = localStorage.getItem("theme") as Theme;
  return storedTheme || null;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const savedTheme = getStoredTheme();

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        const newTheme = e.newValue as Theme;
        setTheme(newTheme);
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
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

  useEffect(() => {
    if (!isMounted) return;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

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
