"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useZustandStore, selectGenderCounts } from "@/store/zustand/store";
import type { Gender } from "@/store/zustand/store";

export default function ZustandPage() {
  const q = useZustandStore((s) => s.preferences.q);
  const limit = useZustandStore((s) => s.preferences.limit);
  const setQuery = useZustandStore((s) => s.preferences.setQuery);
  const setLimit = useZustandStore((s) => s.preferences.setLimit);
  const hydrate = useZustandStore((s) => s.preferences.hydrate);

  const users = useZustandStore((s) => s.users.items);
  const total = useZustandStore((s) => s.users.total);
  const status = useZustandStore((s) => s.users.status);
  const error = useZustandStore((s) => s.users.error);
  const nextCursor = useZustandStore((s) => s.users.nextCursor);
  const fetchUsersPage = useZustandStore((s) => s.users.fetchUsersPage);
  const createUser = useZustandStore((s) => s.users.createUser);
  const deleteUser = useZustandStore((s) => s.users.deleteUser);
  const resetUsers = useZustandStore((s) => s.users.resetUsers);

  // Local input states
  const [localQ, setLocalQ] = useState("");
  const [form, setForm] = useState<{
    name: string;
    email: string;
    gender: Gender;
    title: string;
  }>({ name: "", email: "", gender: "other", title: "" });
  const canSubmit = useMemo(
    () => form.name && form.email && form.title && form.gender,
    [form]
  );

  // Hydrate preferences from localStorage and kick initial fetch
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("prefs");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{ q: string; limit: number }>;
        if (parsed.q != null) hydrate({ q: parsed.q });
        if (parsed.limit != null) hydrate({ limit: parsed.limit });
      }
    } catch {}
    // initial fetch
    fetchUsersPage({ q: undefined, limit, cursor: null, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local input in sync when q from store changes
  useEffect(() => {
    setLocalQ(q || "");
  }, [q]);

  const genderCounts = useMemo(() => selectGenderCounts(users), [users]);

  return (
    <div className="grid gap-4 p-2">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Zustand Demo</h1>
        <p className="text-sm text-muted-foreground">
          與 Redux 頁面相同功能：搜尋、分頁、建立/刪除、彙總。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search name/email/title (stored in Zustand)"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          className="max-w-xs"
        />
        <Button
          variant="default"
          onClick={() => {
            setQuery(localQ);
            fetchUsersPage({
              q: localQ || undefined,
              limit,
              cursor: null,
              replace: true,
            });
          }}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Searching..." : "Search"}
        </Button>
        <label className="text-sm text-muted-foreground">Limit</label>
        <Input
          type="number"
          min={1}
          max={50}
          value={limit}
          onChange={(e) => {
            const next = Number(e.target.value) || 1;
            setLimit(next);
            fetchUsersPage({
              q: q || undefined,
              limit: next,
              cursor: null,
              replace: true,
            });
          }}
          className="w-20"
        />
        <div className="text-xs text-muted-foreground">
          Applied q: {q || "(none)"}
        </div>
      </div>

      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit || status === "loading") return;
          createUser(form).finally(() =>
            setForm({ name: "", email: "", gender: "other", title: "" })
          );
        }}
      >
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          className="max-w-[200px]"
        />
        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          className="max-w-[240px]"
        />
        <select
          value={form.gender}
          onChange={(e) =>
            setForm((s) => ({ ...s, gender: e.target.value as Gender }))
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="male">male</option>
          <option value="female">female</option>
          <option value="non-binary">non-binary</option>
          <option value="other">other</option>
        </select>
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
          className="max-w-[220px]"
        />
        <Button type="submit" disabled={!canSubmit || status === "loading"}>
          {status === "loading" ? "Creating..." : "Add User"}
        </Button>
      </form>

      <div className="flex items-center gap-4 text-sm">
        <div>Status: {status}</div>
        {error && <div className="text-red-500">Error: {error}</div>}
        <div>Total: {total}</div>
        <div className="text-muted-foreground">
          Gender counts: male {genderCounts.male ?? 0}, female{" "}
          {genderCounts.female ?? 0}, nb {genderCounts["non-binary"] ?? 0},
          other {genderCounts.other ?? 0}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            resetUsers();
            fetchUsersPage({
              q: q || undefined,
              limit,
              cursor: null,
              replace: true,
            });
          }}
        >
          Reset
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Title</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.gender}</TableCell>
              <TableCell>{u.title}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => deleteUser(u.id)}
                  disabled={status === "loading"}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() =>
            fetchUsersPage({
              q: q || undefined,
              limit,
              cursor: nextCursor,
              replace: false,
            })
          }
          disabled={!nextCursor || status === "loading"}
        >
          {status === "loading"
            ? "Loading more..."
            : nextCursor
            ? "Load more"
            : "No more"}
        </Button>
      </div>
    </div>
  );
}
