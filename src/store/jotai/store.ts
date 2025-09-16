"use client";

import { atom } from "jotai";
import type { UsersPage, NewUserInput } from "@/services/user";
import {
  getUsersPage,
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
} from "@/services/user";

export type Gender = "male" | "female" | "non-binary" | "other";
export type User = {
  id: number;
  name: string;
  email: string;
  gender: Gender;
  title: string;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

// Preferences
export const qAtom = atom<string>("");
export const limitAtom = atom<number>(20);

export const setQueryAtom = atom(null, (_get, set, q: string) => {
  set(qAtom, q);
  savePrefsToLS({ q });
});
export const setLimitAtom = atom(null, (_get, set, limit: number) => {
  const next = Math.max(1, Math.min(50, limit));
  set(limitAtom, next);
  savePrefsToLS({ limit: next });
});
export const hydratePrefsAtom = atom(
  null,
  (_get, set, patch: Partial<{ q: string; limit: number }>) => {
    if (patch.q != null) set(qAtom, patch.q);
    if (patch.limit != null)
      set(limitAtom, Math.max(1, Math.min(50, patch.limit)));
  }
);

// Users state
export const usersAtom = atom<User[]>([]);
export const nextCursorAtom = atom<number | null>(null);
export const totalAtom = atom<number>(0);
export const statusAtom = atom<Status>("idle");
export const errorAtom = atom<string | null>(null);

// Derived
export const genderCountsAtom = atom((get) => {
  const users = get(usersAtom);
  return users.reduce((acc, u) => {
    acc[u.gender] = (acc[u.gender] ?? 0) + 1;
    return acc;
  }, {} as Record<Gender, number>);
});

// Actions
export const fetchUsersPageAtom = atom(
  null,
  async (
    get,
    set,
    args: {
      q?: string;
      cursor: number | null;
      limit?: number;
      replace?: boolean;
    }
  ) => {
    set(statusAtom, "loading");
    set(errorAtom, null);
    try {
      const page: UsersPage = await getUsersPage({
        q: args.q,
        cursor: args.cursor ?? undefined,
        limit: args.limit,
      });
      set(usersAtom, (prev) =>
        args.replace ? page.items : mergeById(prev, page.items)
      );
      set(nextCursorAtom, page.nextCursor);
      set(totalAtom, page.total);
      set(statusAtom, "succeeded");
    } catch (e: any) {
      set(statusAtom, "failed");
      set(errorAtom, e?.message ?? "Unknown error");
    }
  }
);

export const createUserAtom = atom(
  null,
  async (_get, set, input: NewUserInput) => {
    set(statusAtom, "loading");
    try {
      const created = (await apiCreateUser(input)) as User;
      set(usersAtom, (prev) => mergeById(prev, [created]));
      set(totalAtom, (prev) => prev + 1);
      set(statusAtom, "succeeded");
    } catch (e: any) {
      set(statusAtom, "failed");
      set(errorAtom, e?.message ?? "Create failed");
    }
  }
);

export const deleteUserAtom = atom(null, async (_get, set, id: number) => {
  set(statusAtom, "loading");
  try {
    const res = (await apiDeleteUser(id)) as { ok: boolean; removed: User };
    if (!res?.ok) throw new Error("Delete failed");
    set(usersAtom, (prev) => prev.filter((u) => u.id !== id));
    set(totalAtom, (prev) => Math.max(0, prev - 1));
    set(statusAtom, "succeeded");
  } catch (e: any) {
    set(statusAtom, "failed");
    set(errorAtom, e?.message ?? "Delete failed");
  }
});

export const resetUsersAtom = atom(null, (_get, set) => {
  set(usersAtom, []);
  set(nextCursorAtom, null);
  set(totalAtom, 0);
  set(statusAtom, "idle");
  set(errorAtom, null);
});

export const doNothingAtom = atom(null, (_get) => {
  console.log("doNothing");
});

function mergeById(existing: User[], incoming: User[]): User[] {
  const map = new Map<number, User>();
  for (const u of existing) map.set(u.id, u);
  for (const u of incoming) map.set(u.id, u);
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

function savePrefsToLS(patch: Partial<{ q: string; limit: number }>) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("prefs");
    const prev = raw ? (JSON.parse(raw) as { q?: string; limit?: number }) : {};
    const next = { ...prev, ...patch };
    window.localStorage.setItem("prefs", JSON.stringify(next));
  } catch {}
}
