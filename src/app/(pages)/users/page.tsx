import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { getUsers } from "@/services/user";

import { Users } from "./_components/users";
import { UsersInfinite } from "./_components/users-infinite";

export default function UsersPage() {
  const queryClient = new QueryClient();

  queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="grid gap-6 p-2">
        <div>
          <p className="text-sm text-muted-foreground">Prefetched first page below; infinite list demo using TanStack.</p>
        </div>
        <UsersInfinite />
      </div>
    </HydrationBoundary>
  );
}
