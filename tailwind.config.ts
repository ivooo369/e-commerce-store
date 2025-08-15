import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary": "var(--bg-tertiary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "border-color": "var(--border-color)",
        "accent-color": "var(--accent-color)",
        "accent-hover": "var(--accent-hover)",
        "success-color": "var(--success-color)",
        "error-color": "var(--error-color)",
        "warning-color": "var(--warning-color)",
        "card-bg": "var(--card-bg)",
        "card-border": "var(--card-border)",
      },
    },
  },
  plugins: [],
};

export default config;
