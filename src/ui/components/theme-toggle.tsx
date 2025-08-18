"use client";

import { useTheme } from "@/lib/themeContext";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <IconButton
        onClick={toggleTheme}
        className="text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
}
