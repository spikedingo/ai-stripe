"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Bot,
  Activity,
  Settings,
  Plus,
  Wallet,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore, useBalanceStore } from "@/stores";
import { formatUSDC } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navItems = [
  {
    label: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    label: "Agents",
    href: "/agents",
    icon: Bot,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Activity,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { balance } = useBalanceStore();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-bg-secondary border-r border-border-subtle transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border-subtle px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary">
              <Bot className="h-5 w-5 text-text-inverse" />
            </div>
            <span className="font-semibold text-text-primary">AI Agent</span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary mx-auto">
            <Bot className="h-5 w-5 text-text-inverse" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Link href="/chat">
          <Button
            variant="secondary"
            className={cn("w-full justify-start gap-2", collapsed && "justify-center")}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>New Chat</span>}
          </Button>
        </Link>
      </div>

      {/* Balance Card */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-lg bg-bg-tertiary p-3">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <Wallet className="h-4 w-4" />
            <span>Balance</span>
          </div>
          <div className="text-lg font-semibold text-text-primary">
            {formatUSDC(balance.available)}
          </div>
          <Link href="/settings?tab=billing">
            <Button variant="link" size="sm" className="p-0 h-auto text-accent-primary">
              Add Funds
            </Button>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  isActive
                    ? "bg-bg-active text-text-primary"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                  collapsed && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border-subtle p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2",
            collapsed && "justify-center"
          )}
        >
          <Avatar fallback={user?.name?.[0] || "U"} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-text-primary">
                {user?.name || "User"}
              </div>
              <div className="truncate text-xs text-text-tertiary">
                {user?.email || "user@example.com"}
              </div>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon-sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

