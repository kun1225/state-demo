import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { getUsers } from "@/services/user";

import { Users } from "./_components/users";

export default function UsersPage() {
  const queryClient = new QueryClient();

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
