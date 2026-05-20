"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { themeStore, type ThemeState } from "@/store/rtk/theme-store";
import { toggleTheme } from "@/store/rtk/theme-slice";
import { ThemeView } from "../_components/theme-view";

function ThemeToggle() {
  const theme = useSelector((s: ThemeState) => s.theme.theme);
  const dispatch = useDispatch();

  return <ThemeView theme={theme} onToggle={() => dispatch(toggleTheme())} />;
}

export default function RtkThemePage() {
  return (
    <Provider store={themeStore}>
      <ThemeToggle />
    </Provider>
  );
}
