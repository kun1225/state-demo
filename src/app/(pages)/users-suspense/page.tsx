import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";

import { getUsers } from "@/services/user";

import { Users } from "./_components/users";

export default function UsersPage() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <p>Header</p>
      <Users />
    </HydrationBoundary>
  );
}
