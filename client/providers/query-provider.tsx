"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, 
            refetchOnWindowFocus: false,
            retry: 1,
            // Queries pause while offline and refetch as soon as the connection returns.
            refetchOnReconnect: true,
          },
          mutations: {
            // Fail straight away when offline instead of silently waiting to send later:
            // the app is online-first and the user should know their submit did not go through.
            networkMode: "always",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}