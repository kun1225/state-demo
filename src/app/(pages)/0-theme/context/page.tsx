"use client";

import { ThemeProvider, useTheme } from "@/store/context/theme-provider";
import { ThemeView } from "../_components/theme-view";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <ThemeView theme={theme} onToggle={toggleTheme} />;
}

export default function ContextThemePage() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}
