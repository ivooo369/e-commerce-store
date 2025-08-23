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
        sx={{
          color: theme === "light" ? "black" : "white",
          "&:hover": {
            backgroundColor:
              theme === "light"
                ? "rgba(0, 0, 0, 0.04)"
                : "rgba(255, 255, 255, 0.08)",
          },
        }}
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
}
