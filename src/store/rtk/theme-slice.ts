import { createSlice } from "@reduxjs/toolkit";

type Theme = "light" | "dark";

type ThemeState = { theme: Theme };

const themeSlice = createSlice({
  name: "theme",
  initialState: { theme: "light" } as ThemeState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
