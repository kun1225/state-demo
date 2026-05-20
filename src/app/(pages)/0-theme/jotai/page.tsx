"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { themeAtom, toggleThemeAtom } from "@/store/jotai/theme-atom";
import { ThemeView } from "../_components/theme-view";

export default function JotaiThemePage() {
  const theme = useAtomValue(themeAtom);
  const toggleTheme = useSetAtom(toggleThemeAtom);

  return <ThemeView theme={theme} onToggle={toggleTheme} />;
}
