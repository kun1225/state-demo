"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, getUsersPage, type NewUserInput, type UsersPage } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function UsersInfinite() {
  const [q, setQ] = useState("");
  const [limit] = useState(20);
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<UsersPage>({
    queryKey: ["users.infinite", { q, limit }],
    queryFn: ({ pageParam }) =>
      getUsersPage({ q: q || undefined, limit, cursor: (pageParam as number | null) ?? null }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as number | null,
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  // IntersectionObserver sentinel for auto-load more
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  // Create user mutation with optimistic update (prepend to first page)
  const [form, setForm] = useState<NewUserInput>({ name: "", email: "", gender: "other", title: "" });
  const canSubmit = useMemo(() => form.name && form.email && form.title && form.gender, [form]);

  const createMutation = useMutation({
    mutationFn: (input: NewUserInput) => createUser(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["users.infinite"] });
      const key = ["users.infinite", { q, limit }];
      const previous = queryClient.getQueryData<InfiniteData<UsersPage>>(key);
      const optimisticId = Math.floor(Math.random() * -1000000);
      queryClient.setQueryData<InfiniteData<UsersPage>>(key, (old) => {
        if (!old) return old as any;
        const first = old.pages[0];
        const optimistic = { id: optimisticId, ...input } as UsersPage["items"][number];
        const updatedFirst: UsersPage = {
          ...first,
          items: [optimistic, ...first.items],
          total: first.total + 1,
        };
        return { ...old, pages: [updatedFirst, ...old.pages.slice(1)] };
      });
      return { previous, key, optimisticId };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (created, _vars, ctx) => {
      if (!ctx) return;
      // Replace optimistic with real item in first page
      queryClient.setQueryData<InfiniteData<UsersPage>>(ctx.key, (old) => {
        if (!old) return old as any;
        const pages = old.pages.map((p, idx) => {
          if (idx !== 0) return p;
          return {
            ...p,
            items: p.items.map((it) => (it.id === ctx.optimisticId ? created : it)),
          };
        });
        return { ...old, pages };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users.infinite"] });
    },
  });

  // Delete user mutation with optimistic removal across all pages
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["users.infinite"] });
      const key = ["users.infinite", { q, limit }];
      const previous = queryClient.getQueryData<InfiniteData<UsersPage>>(key);
      queryClient.setQueryData<InfiniteData<UsersPage>>(key, (old) => {
        if (!old) return old as any;
        const pages = old.pages.map((p) => ({
          ...p,
          items: p.items.filter((u) => u.id !== id),
          total: Math.max(0, p.total - 1),
        }));
        return { ...old, pages };
      });
      return { previous, key };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users.infinite"] });
    },
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name/email/title"
          className="max-w-xs"
        />
        <Button onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? "Fetching..." : "Search"}
        </Button>
        <div className="text-xs text-muted-foreground">Total loaded: {items.length}</div>
      </div>

      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit || createMutation.isPending) return;
          createMutation.mutate(form);
          setForm({ name: "", email: "", gender: "other", title: "" });
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
          onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value as NewUserInput["gender"] }))}
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
        <Button type="submit" disabled={!canSubmit || createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Add User"}
        </Button>
      </form>

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
          {items.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.gender}</TableCell>
              <TableCell>{u.title}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(u.id)}
                  disabled={deleteMutation.isPending}
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
          onClick={() => query.fetchNextPage()}
          disabled={!query.hasNextPage || query.isFetchingNextPage}
        >
          {query.isFetchingNextPage ? "Loading more..." : query.hasNextPage ? "Load more" : "No more"}
        </Button>
        {query.isPending && <span className="text-sm text-muted-foreground">Loading...</span>}
      </div>

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} className="h-8" />
    </div>
  );
}
