"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  Filter,
  Search,
  ExternalLink,
  Loader2,
  Receipt,
} from "lucide-react";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOrdersStore, type Order } from "@/stores/orders-store";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";

type OrderStatus = Order["status"];

const statusConfig: Record<
  OrderStatus,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  pending: {
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "Pending",
  },
  completed: {
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "Completed",
  },
  failed: {
    icon: XCircle,
    color: "text-error",
    bgColor: "bg-error/10",
    label: "Failed",
  },
  refunded: {
    icon: RefreshCcw,
    color: "text-info",
    bgColor: "bg-info/10",
    label: "Refunded",
  },
};

const filterOptions = [
  { value: "all", label: "All Orders" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export default function OrdersPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { orders, isLoading, error, hasMore, fetchOrders, loadMoreOrders } =
    useOrdersStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const hasFetchedRef = React.useRef(false);

  // Fetch orders on mount
  React.useEffect(() => {
    if (authenticated && ready && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      const loadOrders = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            await fetchOrders(token);
          }
        } catch (error) {
          console.error("[OrdersPage] Failed to load orders:", error);
        }
      };
      loadOrders();
    }
  }, [authenticated, ready, getAccessToken, fetchOrders]);

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    let filtered = orders;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.merchant.toLowerCase().includes(query) ||
          order.description?.toLowerCase().includes(query) ||
          order.agent_name?.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((order) => order.status === activeFilter);
    }

    return filtered;
  }, [orders, searchQuery, activeFilter]);

  // Group orders by date
  const groupedOrders = React.useMemo(() => {
    const groups: Record<string, Order[]> = {};

    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year:
            date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(order);
    });

    return groups;
  }, [filteredOrders]);

  // Handle load more
  const handleLoadMore = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        await loadMoreOrders(token);
      }
    } catch (error) {
      console.error("[ActivityPage] Failed to load more orders:", error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        await fetchOrders(token);
      }
    } catch (error) {
      console.error("[ActivityPage] Failed to refresh orders:", error);
    }
  };

  // Truncate tx hash for display
  const truncateTxHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <>
      <Header title="Orders" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Orders
              </h2>
              <p className="text-text-secondary">
                Track all payments and transactions
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCcw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilter === option.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6 border-error/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-error">
                  <XCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders List */}
          {isLoading && orders.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-bg-secondary" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-bg-secondary rounded" />
                        <div className="h-3 w-2/3 bg-bg-secondary rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No orders found
                </h3>
                <p className="text-text-secondary">
                  {searchQuery || activeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Your order history will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedOrders).map(([date, dateOrders]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-text-tertiary mb-3">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {dateOrders.map((order) => {
                      const config = statusConfig[order.status];
                      const Icon = config.icon;

                      return (
                        <Card
                          key={order.id}
                          className="hover:border-border-default transition-colors"
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Icon */}
                              <div
                                className={`h-10 w-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                              >
                                <Icon className={`h-5 w-5 ${config.color}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-text-primary">
                                      {order.merchant}
                                    </p>
                                    {order.description && (
                                      <p className="text-sm text-text-secondary mt-0.5">
                                        {order.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-text-primary">
                                      {formatCurrency(order.amount)}
                                    </p>
                                    <span className="text-xs text-text-tertiary">
                                      {formatRelativeTime(order.created_at)}
                                    </span>
                                  </div>
                                </div>

                                {/* Metadata */}
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Badge
                                    variant={
                                      order.status === "completed"
                                        ? "success"
                                        : order.status === "failed"
                                          ? "error"
                                          : order.status === "pending"
                                            ? "warning"
                                            : "outline"
                                    }
                                  >
                                    {config.label}
                                  </Badge>

                                  {order.tx_hash && (
                                    <Badge
                                      variant="outline"
                                      className="cursor-pointer hover:bg-bg-hover"
                                    >
                                      <span className="truncate">
                                        {truncateTxHash(order.tx_hash)}
                                      </span>
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Badge>
                                  )}

                                  {order.agent_name && (
                                    <Badge variant="default" className="text-xs">
                                      <CreditCard className="h-3 w-3 mr-1" />
                                      {order.agent_name}
                                    </Badge>
                                  )}

                                  {order.currency && order.currency !== "USDC" && (
                                    <Badge variant="outline">{order.currency}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
