"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUsersPage, type UsersPage } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function UsersInfinite() {
  const [q, setQ] = useState("");
  const [limit] = useState(20);

  const query = useInfiniteQuery<UsersPage>({
    queryKey: ["users.infinite", { q, limit }],
    queryFn: ({ pageParam }) =>
      getUsersPage({ q: q || undefined, limit, cursor: (pageParam as number | null) ?? null }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as number | null,
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.gender}</TableCell>
              <TableCell>{u.title}</TableCell>
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
    </div>
  );
}
