import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeStore = {
  theme: Theme;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "light",

  toggleTheme: () =>
    set({ theme: get().theme === "light" ? "dark" : "light" }),
}));
