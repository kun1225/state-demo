import { atom } from "jotai";

type Theme = "light" | "dark";

export const themeAtom = atom<Theme>("light");

export const toggleThemeAtom = atom(null, (get, set) => {
  set(themeAtom, get(themeAtom) === "light" ? "dark" : "light");
});
