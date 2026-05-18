import type { AuthUser, Preferences, Todo, User } from "@/types";

export const db = {
  user: {
    id: "user-1",
    name: "Alice Chen",
    email: "alice@example.com",
  } as AuthUser,

  preferences: {
    theme: "light",
    lang: "zh",
  } as Preferences,

  users: [
    {
      id: "u1",
      name: "Alice Chen",
      email: "alice@example.com",
      role: "admin",
      createdAt: "2024-01-15T08:00:00Z",
    },
    {
      id: "u2",
      name: "Bob Lin",
      email: "bob@example.com",
      role: "editor",
      createdAt: "2024-02-20T10:30:00Z",
    },
    {
      id: "u3",
      name: "Carol Wu",
      email: "carol@example.com",
      role: "viewer",
      createdAt: "2024-03-05T14:00:00Z",
    },
    {
      id: "u4",
      name: "David Huang",
      email: "david@example.com",
      role: "editor",
      createdAt: "2024-04-10T09:15:00Z",
    },
    {
      id: "u5",
      name: "Eva Zhang",
      email: "eva@example.com",
      role: "viewer",
      createdAt: "2024-05-22T11:45:00Z",
    },
    {
      id: "u6",
      name: "Frank Liu",
      email: "frank@example.com",
      role: "admin",
      createdAt: "2024-06-01T16:00:00Z",
    },
    {
      id: "u7",
      name: "Grace Wang",
      email: "grace@example.com",
      role: "viewer",
      createdAt: "2024-07-18T08:30:00Z",
    },
    {
      id: "u8",
      name: "Henry Tsai",
      email: "henry@example.com",
      role: "editor",
      createdAt: "2024-08-09T13:00:00Z",
    },
    {
      id: "u9",
      name: "Iris Ho",
      email: "iris@example.com",
      role: "viewer",
      createdAt: "2024-09-14T10:00:00Z",
    },
    {
      id: "u10",
      name: "Jack Su",
      email: "jack@example.com",
      role: "editor",
      createdAt: "2024-10-03T15:30:00Z",
    },
    {
      id: "u11",
      name: "Karen Liao",
      email: "karen@example.com",
      role: "viewer",
      createdAt: "2024-11-20T09:00:00Z",
    },
    {
      id: "u12",
      name: "Leo Chang",
      email: "leo@example.com",
      role: "admin",
      createdAt: "2024-12-01T14:30:00Z",
    },
  ] as User[],

  todos: [
    { id: "t1", title: "完成報告", ownerId: "user-1", lang: "zh", done: false },
    {
      id: "t2",
      title: "Review PR",
      ownerId: "user-1",
      lang: "en",
      done: false,
    },
    {
      id: "t3",
      title: "開會討論需求",
      ownerId: "user-1",
      lang: "zh",
      done: true,
    },
    {
      id: "t4",
      title: "Fix bug #42",
      ownerId: "user-1",
      lang: "en",
      done: false,
    },
    { id: "t5", title: "更新文件", ownerId: "user-1", lang: "zh", done: false },
  ] as Todo[],
};

export const INITIAL_USER: AuthUser = { ...db.user };
export const INITIAL_PREFERENCES: Preferences = { ...db.preferences };
