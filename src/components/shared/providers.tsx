"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { base } from "viem/chains";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useThemeStore, useAuthStore } from "@/stores";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Privy app configuration
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmjjone9m001cle0co0c22e9f";

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

// Component to sync Privy auth state with our store
function AuthSynchronizer({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const syncPrivyUser = useAuthStore((state) => state.syncPrivyUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  React.useEffect(() => {
    if (!ready) {
      setLoading(true);
      return;
    }

    if (authenticated && user) {
      // [PRIVY_DEBUG] Sync user with wallets
      console.log("[PRIVY_DEBUG] Syncing user:", user.id, "wallets:", wallets.length);
      syncPrivyUser(user, wallets);
    } else {
      syncPrivyUser(null);
    }
  }, [ready, authenticated, user, wallets, syncPrivyUser, setLoading]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "google", "twitter"],
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          logo: undefined,
        },
        // Embedded wallet configuration - auto create for all users
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
        },
        // Default chain configuration
        defaultChain: base,
        supportedChains: [base],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthSynchronizer>
              <ThemeInitializer>{children}</ThemeInitializer>
            </AuthSynchronizer>
          </ToastProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

