"use client";

import { useQuery } from "@tanstack/react-query";

import { getUsers } from "@/services/user";

export function Users() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.length}</div>;
}
