"use client";

import { ThemeProvider, useTheme } from "@/store/context/theme-provider";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center gap-6 transition-colors ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <p className="text-2xl font-semibold">Current theme: {theme}</p>
      <Button variant={theme === "dark" ? "secondary" : "default"} onClick={toggleTheme}>
        Switch to {theme === "light" ? "dark" : "light"}
      </Button>
    </div>
  );
}

export default function ContextThemePage() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}
