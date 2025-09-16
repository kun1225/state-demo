"use client";

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { UsersPage, NewUserInput } from "@/services/user";
import { getUsersPage, createUser as apiCreateUser, deleteUser as apiDeleteUser } from "@/services/user";

export type Gender = "male" | "female" | "non-binary" | "other";

export type User = {
  id: number;
  name: string;
  email: string;
  gender: Gender;
  title: string;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

type PreferencesState = {
  q: string;
  limit: number;
  setQuery: (q: string) => void;
  setLimit: (limit: number) => void;
  hydrate: (patch: Partial<Pick<PreferencesState, "q" | "limit">>) => void;
  resetPreferences: () => void;
};

type UsersState = {
  items: User[];
  nextCursor: number | null;
  total: number;
  status: Status;
  error: string | null;
  resetUsers: () => void;
  fetchUsersPage: (args: { q?: string; cursor: number | null; limit?: number; replace?: boolean }) => Promise<void>;
  createUser: (input: NewUserInput) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
};

export type StoreState = {
  preferences: PreferencesState;
  users: UsersState;
};

const initialPreferences = { q: "", limit: 20 };

export const useZustandStore = create<StoreState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        preferences: {
          ...initialPreferences,
          setQuery: (q) =>
            set((s) => {
              const next = { ...s.preferences, q };
              savePrefs(next.q, next.limit);
              return { preferences: next };
            }),
          setLimit: (limit) =>
            set((s) => {
              const next = { ...s.preferences, limit: Math.max(1, Math.min(50, limit)) };
              savePrefs(next.q, next.limit);
              return { preferences: next };
            }),
          hydrate: (patch) =>
            set((s) => {
              const next = { ...s.preferences, ...patch };
              return { preferences: next };
            }),
          resetPreferences: () =>
            set({
              preferences: {
                ...initialPreferences,
                setQuery: get().preferences.setQuery,
                setLimit: get().preferences.setLimit,
                hydrate: get().preferences.hydrate,
                resetPreferences: get().preferences.resetPreferences,
              } as any,
            }),
        },
        users: {
          items: [],
          nextCursor: null,
          total: 0,
          status: "idle",
          error: null,
          resetUsers: () =>
            set((s) => ({ users: { ...s.users, items: [], nextCursor: null, total: 0, status: "idle", error: null } })),
          fetchUsersPage: async ({ q, cursor, limit, replace }) => {
            set((s) => ({ users: { ...s.users, status: "loading", error: null } }));
            try {
              const page: UsersPage = await getUsersPage({ q, cursor: cursor ?? undefined, limit });
              set((s) => ({
                users: {
                  ...s.users,
                  items: replace ? page.items : mergeById(s.users.items, page.items),
                  nextCursor: page.nextCursor,
                  total: page.total,
                  status: "succeeded",
                  error: null,
                },
              }));
            } catch (e: any) {
              set((s) => ({ users: { ...s.users, status: "failed", error: e?.message ?? "Unknown error" } }));
            }
          },
          createUser: async (input) => {
            set((s) => ({ users: { ...s.users, status: "loading" } }));
            try {
              const created = (await apiCreateUser(input)) as User;
              set((s) => ({
                users: {
                  ...s.users,
                  items: mergeById(s.users.items, [created]),
                  total: s.users.total + 1,
                  status: "succeeded",
                },
              }));
            } catch (e: any) {
              set((s) => ({ users: { ...s.users, status: "failed", error: e?.message ?? "Create failed" } }));
            }
          },
          deleteUser: async (id: number) => {
            set((s) => ({ users: { ...s.users, status: "loading" } }));
            try {
              const res = (await apiDeleteUser(id)) as { ok: boolean; removed: User };
              if (res?.ok) {
                set((s) => ({
                  users: {
                    ...s.users,
                    items: s.users.items.filter((u) => u.id !== id),
                    total: Math.max(0, s.users.total - 1),
                    status: "succeeded",
                  },
                }));
              } else {
                throw new Error("Delete failed");
              }
            } catch (e: any) {
              set((s) => ({ users: { ...s.users, status: "failed", error: e?.message ?? "Delete failed" } }));
            }
          },
        },
      }),
      {
        name: "zustand-prefs",
        partialize: (state) => ({ preferences: { q: state.preferences.q, limit: state.preferences.limit } }),
        version: 1,
        skipHydration: true,
      }
    )
  )
);

function mergeById(existing: User[], incoming: User[]): User[] {
  const map = new Map<number, User>();
  for (const u of existing) map.set(u.id, u);
  for (const u of incoming) map.set(u.id, u);
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export function selectGenderCounts(users: User[]): Record<Gender, number> {
  return users.reduce((acc, u) => {
    acc[u.gender] = (acc[u.gender] ?? 0) + 1;
    return acc;
  }, {} as Record<Gender, number>);
}

function savePrefs(q: string, limit: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("prefs", JSON.stringify({ q, limit }));
  } catch {}
}
