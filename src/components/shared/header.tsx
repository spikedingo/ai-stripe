"use client";

import * as React from "react";
import { Menu, Bell, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, useBalanceStore } from "@/stores";
import { formatUSDC } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function Header({ title, onMenuClick, showMobileMenu = true }: HeaderProps) {
  const { user } = useAuthStore();
  const { balance } = useBalanceStore();

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

      <div className="flex items-center gap-3">
        {/* Balance Badge (Mobile) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-tertiary">
          <Wallet className="h-4 w-4 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">
            {formatUSDC(balance.available)}
          </span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge
            variant="error"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            2
          </Badge>
        </Button>

        {/* User Avatar */}
        <Avatar fallback={user?.name?.[0] || "U"} size="md" />
      </div>
    </header>
  );
}

