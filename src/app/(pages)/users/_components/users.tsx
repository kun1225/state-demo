"use client";

import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createUser, deleteUser, getUsers, type NewUserInput } from "@/services/user";

type User = {
  id: number;
  name: string;
  email: string;
  gender: NewUserInput["gender"];
  title: string;
};

export function Users() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading, isFetching } = useQuery<User[]>({
    queryKey: ["users", { q }],
    queryFn: () => getUsers(q || undefined),
  });

  const users = data ?? [];

  const createMutation = useMutation({
    mutationFn: (input: NewUserInput) => createUser(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previous = queryClient.getQueriesData<User[]>({ queryKey: ["users"] });
      // Optimistically update all cached lists
      const optimistic: User = {
        id: Math.floor(Math.random() * -100000),
        ...input,
      } as User;
      previous.forEach(([key, value]) => {
        queryClient.setQueryData<User[]>(key, (old) => [optimistic, ...(old ?? [])]);
      });
      return { previous, optimisticId: optimistic.id };
    },
    onError: (_err, _vars, ctx) => {
      // Rollback
      ctx?.previous?.forEach(([key, value]) => {
        queryClient.setQueryData<User[]>(key, value ?? []);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previous = queryClient.getQueriesData<User[]>({ queryKey: ["users"] });
      previous.forEach(([key, value]) => {
        queryClient.setQueryData<User[]>(key, (old) => (old ?? []).filter((u) => u.id !== id));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, value]) => {
        queryClient.setQueryData<User[]>(key, value ?? []);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [form, setForm] = useState<NewUserInput>({
    name: "",
    email: "",
    gender: "other",
    title: "",
  });

  const canSubmit = useMemo(() => {
    return form.name && form.email && form.title && form.gender;
  }, [form]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          placeholder="Search name/email/title"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, minWidth: 260 }}
        />
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}>
          Invalidate
        </button>
        <button onClick={() => queryClient.refetchQueries({ queryKey: ["users"] })}>
          Refetch
        </button>
        {isFetching ? <span style={{ fontSize: 12 }}>(fetching...)</span> : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          createMutation.mutate(form);
          setForm({ name: "", email: "", gender: "other", title: "" });
        }}
        style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, minWidth: 220 }}
        />
        <select
          value={form.gender}
          onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value as NewUserInput["gender"] }))}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        >
          <option value="male">male</option>
          <option value="female">female</option>
          <option value="non-binary">non-binary</option>
          <option value="other">other</option>
        </select>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, minWidth: 200 }}
        />
        <button type="submit" disabled={!canSubmit || createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Add User"}
        </button>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Gender</th>
              <th style={th}>Title</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={td}>{u.name}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.gender}</td>
                <td style={td}>{u.title}</td>
                <td style={td}>
                  <button
                    onClick={() => deleteMutation.mutate(u.id)}
                    disabled={deleteMutation.isPending}
                    style={{ color: "#b00" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: "#666" }}>Items: {users.length}</div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: 8,
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #f0f0f0",
  padding: 8,
};
