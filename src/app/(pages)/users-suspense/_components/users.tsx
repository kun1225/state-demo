"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { getUsers } from "@/services/user";

export function Users() {
  const { data } = useSuspenseQuery({ queryKey: ["users"], queryFn: () => getUsers() });
  return <div>{data?.length}</div>;
}
