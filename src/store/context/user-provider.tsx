"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser, Preferences, Status } from "@/types";

type UserState = {
  user: AuthUser | null;
  preferences: Preferences;
  status: Status;
  error: string | null;
};

type UserActions = {
  updateUser: (
    patch: Partial<Pick<AuthUser, "name" | "email">>,
  ) => Promise<void>;
  updatePreferences: (patch: Partial<Preferences>) => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<(UserState & UserActions) | null>(null);

const DEFAULT_PREFERENCES: Preferences = { theme: "light", lang: "zh" };

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus("loading");

    fetch("/api/auth")
      .then((r) => r.json())
      .then((data: AuthUser) => {
        setUser(data);
        setStatus("success");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("error");
      });
  }, []);

  const updateUser = useCallback(
    async (patch: Partial<Pick<AuthUser, "name" | "email">>) => {
      const prev = user;
      setUser((u) => (u ? { ...u, ...patch } : u));
      try {
        const updated: AuthUser = await fetch("/api/auth", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }).then((r) => r.json());
        setUser(updated);
      } catch (err) {
        setUser(prev);
        setError(err instanceof Error ? err.message : "Update failed");
      }
    },
    [user],
  );

  const updatePreferences = useCallback(
    async (patch: Partial<Preferences>) => {
      const prev = preferences;
      setPreferences((p) => ({ ...p, ...patch }));
      try {
        const updated: Preferences = await fetch("/api/auth/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }).then((r) => r.json());
        setPreferences(updated);
      } catch (err) {
        setPreferences(prev);
        setError(err instanceof Error ? err.message : "Update failed");
      }
    },
    [preferences],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setPreferences(DEFAULT_PREFERENCES);
    setStatus("idle");
    setError(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        preferences,
        status,
        error,
        updateUser,
        updatePreferences,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
