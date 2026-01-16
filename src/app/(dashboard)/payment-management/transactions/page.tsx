"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Search, Filter } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionList } from "@/components/payment/transaction-list";
import { useActivityStore } from "@/stores";
import {
  filterPaymentEvents,
  mapActivityToTransaction,
  type PaymentTransaction,
} from "@/lib/payment-mapper";
import { formatCurrency } from "@/lib/utils";

const filterOptions = [
  { value: "all", label: "All Transactions" },
  { value: "x402", label: "x402 Transactions" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending Approval" },
];

export default function PaymentTransactionsPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { events, isLoading, fetchEvents } = useActivityStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [merchantFilter, setMerchantFilter] = React.useState<string | null>(null);
  const [channelFilter, setChannelFilter] = React.useState<string | null>(null);

  // Load events
  React.useEffect(() => {
    if (authenticated && ready) {
      const loadData = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            await fetchEvents(token);
          }
        } catch (error) {
          console.error("[PaymentTransactionsPage] Failed to load data:", error);
        }
      };
      loadData();
    }
  }, [authenticated, ready, getAccessToken, fetchEvents]);

  // Map events to transactions
  const transactions = React.useMemo(() => {
    const paymentEvents = filterPaymentEvents(events);
    return paymentEvents
      .map(mapActivityToTransaction)
      .filter((t): t is PaymentTransaction => t !== null);
  }, [events]);

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(query) ||
          tx.merchant?.toLowerCase().includes(query) ||
          tx.paymentChannel?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (activeFilter !== "all") {
      switch (activeFilter) {
        case "x402":
          filtered = filtered.filter((tx) => tx.x402ProtocolCall);
          break;
        case "completed":
          filtered = filtered.filter((tx) => tx.status === "success");
          break;
        case "pending":
          filtered = filtered.filter((tx) => tx.approvalStatus === "pending");
          break;
      }
    }

    // Apply merchant filter
    if (merchantFilter) {
      filtered = filtered.filter((tx) => tx.merchant === merchantFilter);
    }

    // Apply channel filter
    if (channelFilter) {
      filtered = filtered.filter((tx) => tx.channelId === channelFilter);
    }

    return filtered;
  }, [transactions, searchQuery, activeFilter, merchantFilter, channelFilter]);

  // Get unique merchants and channels for filters
  const merchants = React.useMemo(() => {
    const merchantSet = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.merchant) merchantSet.add(tx.merchant);
    });
    return Array.from(merchantSet);
  }, [transactions]);

  const channels = React.useMemo(() => {
    const channelSet = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.paymentChannel) channelSet.add(tx.paymentChannel);
    });
    return Array.from(channelSet);
  }, [transactions]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = transactions.length;
    const x402Count = transactions.filter((tx) => tx.x402ProtocolCall).length;
    const completedCount = transactions.filter((tx) => tx.status === "success").length;
    const pendingCount = transactions.filter((tx) => tx.approvalStatus === "pending").length;
    const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      total,
      x402Count,
      completedCount,
      pendingCount,
      totalVolume,
      successRate: total > 0 ? (completedCount / total) * 100 : 0,
      x402UsageRate: total > 0 ? (x402Count / total) * 100 : 0,
    };
  }, [transactions]);

  return (
    <>
      <Header title="Payment Transactions" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Payment Transactions
            </h2>
            <p className="text-text-secondary">
              Monitor and manage all payment transactions
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-text-tertiary">Total</p>
                <p className="text-xl font-semibold text-text-primary">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-text-tertiary">x402 Usage</p>
                <p className="text-xl font-semibold text-text-primary">
                  {stats.x402UsageRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-text-tertiary">Success Rate</p>
                <p className="text-xl font-semibold text-text-primary">
                  {stats.successRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-text-tertiary">Total Volume</p>
                <p className="text-xl font-semibold text-text-primary">
                  {formatCurrency(stats.totalVolume)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Search transactions..."
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

          {/* Merchant and Channel Filters */}
          {(merchants.length > 0 || channels.length > 0) && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {merchants.length > 0 && (
                <select
                  value={merchantFilter || ""}
                  onChange={(e) => setMerchantFilter(e.target.value || null)}
                  className="px-3 py-2 rounded-lg border border-border-default bg-bg-primary text-text-primary text-sm"
                >
                  <option value="">All Merchants</option>
                  {merchants.map((merchant) => (
                    <option key={merchant} value={merchant}>
                      {merchant}
                    </option>
                  ))}
                </select>
              )}
              {channels.length > 0 && (
                <select
                  value={channelFilter || ""}
                  onChange={(e) => setChannelFilter(e.target.value || null)}
                  className="px-3 py-2 rounded-lg border border-border-default bg-bg-primary text-text-primary text-sm"
                >
                  <option value="">All Channels</option>
                  {channels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Transactions List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 w-3/4 bg-bg-secondary rounded mb-2" />
                    <div className="h-3 w-1/2 bg-bg-secondary rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <Filter className="h-12 w-12 mx-auto text-text-tertiary mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No transactions found
                </h3>
                <p className="text-text-secondary">
                  {searchQuery || activeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Your payment transactions will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <TransactionList transactions={filteredTransactions} />
          )}
        </div>
      </div>
    </>
  );
}
