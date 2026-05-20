"use client";

import { useThemeStore } from "@/store/zustand/theme-store";
import { ThemeView } from "../_components/theme-view";

export default function ZustandThemePage() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return <ThemeView theme={theme} onToggle={toggleTheme} />;
}
