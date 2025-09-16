import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityState } from "@reduxjs/toolkit";
import type { RootState } from "./redux";

export type Gender = "male" | "female" | "non-binary" | "other";

export type User = {
  id: number;
  name: string;
  email: string;
  gender: Gender;
  title: string;
};

export type UsersPage = {
  items: User[];
  nextCursor: number | null;
  total: number;
};

const usersAdapter = createEntityAdapter<User, number>({
  selectId: (u) => u.id,
  sortComparer: (a, b) => a.id - b.id,
});

export type UsersState = EntityState<User, number> & {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  nextCursor: number | null;
  total: number;
};

const initialState: UsersState = usersAdapter.getInitialState({
  status: "idle",
  error: null,
  nextCursor: null,
  total: 0,
});

export const fetchUsersPage = createAsyncThunk<
  UsersPage,
  { q?: string; cursor: number | null; limit?: number; replace?: boolean }
>(
  "users/fetchPage",
  async ({ q, cursor, limit }) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (typeof limit === "number") sp.set("limit", String(limit));
    if (cursor) sp.set("cursor", String(cursor));
    const url = `/api/users${sp.toString() ? `?${sp.toString()}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch users page");
    return (await res.json()) as UsersPage;
  }
);

export const createUser = createAsyncThunk<
  User,
  { name: string; email: string; gender: Gender; title: string }
>("users/create", async (input) => {
  const res = await fetch(`/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return (await res.json()) as User;
});

export const deleteUser = createAsyncThunk<{ ok: boolean; removed: User }, number>(
  "users/delete",
  async (id) => {
    const url = new URL(`/api/users`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    url.searchParams.set("id", String(id));
    const res = await fetch(url.toString(), { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete user");
    return (await res.json()) as { ok: boolean; removed: User };
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    reset(state) {
      Object.assign(state, initialState);
    },
    // Optimistic helpers (optional usage from UI)
    addOptimistic(state, action: { payload: User }) {
      usersAdapter.addOne(state, action.payload);
      state.total += 1;
    },
    removeOptimistic(state, action: { payload: number }) {
      usersAdapter.removeOne(state, action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersPage.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        const replace = action.meta.arg.replace;
        if (replace) {
          usersAdapter.removeAll(state);
          state.nextCursor = null;
          state.total = 0;
        }
      })
      .addCase(fetchUsersPage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const page = action.payload;
        // If replace flag set, replace entities; else, upsert (append/merge)
        const replace = action.meta.arg.replace;
        if (replace) {
          usersAdapter.setAll(state, page.items);
        } else {
          usersAdapter.upsertMany(state, page.items);
        }
        state.nextCursor = page.nextCursor;
        state.total = page.total;
      })
      .addCase(fetchUsersPage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message ?? "Unknown error";
      })
      .addCase(createUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        usersAdapter.addOne(state, action.payload);
        state.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message ?? "Create failed";
      })
      .addCase(deleteUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        usersAdapter.removeOne(state, action.payload.removed.id);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message ?? "Delete failed";
      });
  },
});

export const usersReducer = usersSlice.reducer;
export const usersActions = usersSlice.actions;

// Basic selectors
export const selectUsersState = (s: any) => s.users;
export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors((state: any) => state.users);
export const selectUsersTotal = (s: any) => s.users.total;
export const selectUsersStatus = (s: any) => s.users.status;
export const selectUsersError = (s: any) => s.users.error;
export const selectUsersNextCursor = (s: any) => s.users.nextCursor;

// Derived selector example: group counts by gender
export const selectGenderCounts = createSelector(selectAllUsers, (users) => {
  return users.reduce(
    (acc, u) => {
      acc[u.gender] = (acc[u.gender] ?? 0) + 1;
      return acc;
    },
    {} as Record<Gender, number>
  );
});
