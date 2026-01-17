"use client";

import * as React from "react";
import { Menu, Bell, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores";
import { useUserWallet } from "@/hooks/use-user-wallet";
import { formatUSDC } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function Header({
  title,
  onMenuClick,
  showMobileMenu = true,
}: HeaderProps) {
  const { user } = useAuthStore();
  const { data: walletData, isLoading: walletLoading } = useUserWallet();

  // Get USDC balance from wallet data
  const usdcBalance = walletData?.usdc_balance || "0.0";

  return (
    <header className="flex h-14 items-center justify-between border-b border-border-subtle bg-bg-primary px-4 md:px-6">
      <div className="flex items-center gap-3">
        {showMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        )}
      </div>
    </header>
  );
}
