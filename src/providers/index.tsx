import { TanStackQueryProvider } from "./TanStackQueryProvider";
import { ReduxProvider } from "./ReduxProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TanStackQueryProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </TanStackQueryProvider>
  );
}
