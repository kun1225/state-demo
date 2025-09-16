import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PreferencesState = {
  q: string;
  limit: number;
};

const initialState: PreferencesState = {
  q: "",
  limit: 20,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.q = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = Math.max(1, Math.min(50, action.payload));
    },
    hydrate(state, action: PayloadAction<Partial<PreferencesState>>) {
      Object.assign(state, { ...state, ...action.payload });
    },
    reset() {
      return initialState;
    },
  },
});

export const preferencesReducer = preferencesSlice.reducer;
export const preferencesActions = preferencesSlice.actions;

export const selectQuery = (s: any) => s.preferences.q;
export const selectLimit = (s: any) => s.preferences.limit;
