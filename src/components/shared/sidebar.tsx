"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLogout } from "@privy-io/react-auth";
import {
  Bot,
  Activity,
  Settings,
  Wallet,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Copy,
  Check,
  LayoutDashboard,
  Network,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore, useThemeStore } from "@/stores";
import { formatUSDC } from "@/lib/utils";
import { useUserWallet } from "@/hooks";

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Agents",
    href: "/agents",
    icon: Bot,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  // {
  //   label: "Payment Management",
  //   href: "/payment-management",
  //   icon: CreditCard,
  //   children: [
  //     { label: "Channels", href: "/payment-management/channels", icon: Bot },
  //     { label: "Transactions", href: "/payment-management/transactions", icon: Activity },
  //     { label: "Policies", href: "/payment-management/policies", icon: Settings },
  //     { label: "Merchants", href: "/payment-management/merchants", icon: CreditCard },
  //     { label: "Analytics", href: "/payment-management/analytics", icon: Activity },
  //   ],
  // },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];


export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout: clearAuthStore } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { data: walletData, isLoading: walletLoading } = useUserWallet();
  const [copied, setCopied] = React.useState(false);
  const [expandedMenus, setExpandedMenus] = React.useState<Set<string>>(new Set());

  // Get wallet address from API response
  const address = walletData?.address || null;
  const networkId = walletData?.network_id || null;
  const usdcBalance = walletData?.usdc_balance || "0.0";

  // Format shortened address
  const shortenedAddress = React.useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  // Use Privy logout hook
  const { logout: privyLogout } = useLogout({
    onSuccess: () => {
      // Clear local auth store after Privy logout
      clearAuthStore();
    },
  });

  // Auto-expand payment management menu if active
  React.useEffect(() => {
    if (pathname.startsWith("/payment-management")) {
      setExpandedMenus((prev) => {
        if (!prev.has("/payment-management")) {
          return new Set(prev).add("/payment-management");
        }
        return prev;
      });
    }
  }, [pathname]);

  // Copy wallet address to clipboard
  const copyAddress = React.useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

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
          <Link href="/dashboard" className="flex items-center gap-2">
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

      {/* Balance Card */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-lg bg-bg-tertiary p-3">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <Wallet className="h-4 w-4" />
            <span>Balance</span>
          </div>
          <div className="text-lg font-semibold text-text-primary">
            {walletLoading ? (
              <span className="text-text-tertiary">Loading...</span>
            ) : (
              formatUSDC(parseFloat(usdcBalance))
            )}
          </div>
          {/* Network Info */}
          {networkId && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border-subtle">
              {(networkId === "base" || networkId === "base-sepolia") ? (
                <Image
                  src="/images/png/base_chain.png"
                  alt="Base"
                  width={14}
                  height={14}
                  className="flex-shrink-0"
                />
              ) : (
                <Network className="h-3.5 w-3.5 text-text-tertiary" />
              )}
              <span className="text-xs text-text-tertiary capitalize">
                {networkId.replace("-", " ")}
              </span>
            </div>
          )}
          <Link href="/settings?tab=billing">
            <Button variant="link" size="sm" className="p-0 h-auto text-accent-primary mt-2">
              Add Funds
            </Button>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenus.has(item.href);
          const isPaymentManagementActive = item.href === "/payment-management" && pathname.startsWith("/payment-management");

          const Icon = item.icon;

          if (hasChildren && !collapsed) {
            return (
              <div key={item.href}>
                <button
                  onClick={() => {
                    setExpandedMenus((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.href)) {
                        next.delete(item.href);
                      } else {
                        next.add(item.href);
                      }
                      return next;
                    });
                  }}
                  className={cn(
                    "flex items-center justify-between w-full rounded-lg px-3 py-2.5 transition-colors",
                    isPaymentManagementActive
                      ? "bg-bg-active text-text-primary"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border-subtle pl-2">
                    {item.children!.map((child) => {
                      const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                      const ChildIcon = child.icon;
                      return (
                        <Link key={child.href} href={child.href}>
                          <div
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                              isChildActive
                                ? "bg-bg-active text-text-primary"
                                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                            )}
                          >
                            <ChildIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-sm">{child.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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

      {/* Theme Toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 w-full transition-colors",
            "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
            collapsed && "justify-center"
          )}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Moon className="h-5 w-5 flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="truncate">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </div>

      {/* User Section */}
      <div className="border-t border-border-subtle p-3">
        {/* Wallet Address */}
        {shortenedAddress && !collapsed && (
          <button
            onClick={copyAddress}
            className="flex items-center gap-2 w-full px-3 py-2 mb-2 rounded-lg bg-bg-tertiary hover:bg-bg-hover transition-colors"
          >
            <Wallet className="h-4 w-4 text-accent-primary flex-shrink-0" />
            <span className="text-xs font-mono text-text-secondary truncate">
              {shortenedAddress}
            </span>
            {copied ? (
              <Check className="h-3 w-3 text-success flex-shrink-0 ml-auto" />
            ) : (
              <Copy className="h-3 w-3 text-text-tertiary flex-shrink-0 ml-auto" />
            )}
          </button>
        )}

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
            <Button variant="ghost" size="icon-sm" onClick={privyLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
