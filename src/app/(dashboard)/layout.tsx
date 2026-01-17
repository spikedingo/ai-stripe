"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Sidebar } from "@/components/shared/sidebar";
import { useAuthStore, useBalanceStore, useAgentStore } from "@/stores";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { ready, authenticated, user: privyUser, getAccessToken } = usePrivy();
  const { syncPrivyUser, isAuthenticated } = useAuthStore();
  const { fetchBalance, fetchTransactions } = useBalanceStore();
  const { fetchAgents } = useAgentStore();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Sync Privy user to auth store when ready
  React.useEffect(() => {
    if (ready) {
      syncPrivyUser(authenticated ? privyUser : null);
    }
  }, [ready, authenticated, privyUser, syncPrivyUser]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
    }
  }, [ready, authenticated, router]);

  // Fetch initial data when authenticated (only balance and transactions, agents are loaded in pages)
  React.useEffect(() => {
    if (isAuthenticated && authenticated && ready) {
      const loadData = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            fetchBalance();
            fetchTransactions();
            // Don't fetch agents here - let individual pages handle it to avoid duplicate calls
          }
        } catch (error) {
          console.error("[DashboardLayout] Failed to load data:", error);
        }
      };
      loadData();
    }
  }, [isAuthenticated, authenticated, ready, getAccessToken, fetchBalance, fetchTransactions]);

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
