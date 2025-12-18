"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useThemeStore } from "@/stores";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

// Component to initialize theme on mount
function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  
  React.useEffect(() => {
    // Apply theme class to html element
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>
          <ThemeInitializer>{children}</ThemeInitializer>
        </ToastProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

