import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./theme-slice";

export const themeStore = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

export type ThemeState = ReturnType<typeof themeStore.getState>;
export type ThemeDispatch = typeof themeStore.dispatch;
