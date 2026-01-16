"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { TrendingUp, DollarSign, CheckCircle2, Clock, Zap } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentStatsCard } from "@/components/payment/payment-stats-card";
import { useAgentStore, useActivityStore, useAnalyticsStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { agents, fetchAgents, isLoading: agentsLoading } = useAgentStore();
  const { events, fetchEvents, isLoading: eventsLoading } = useActivityStore();
  const { analytics, calculateAnalytics, isLoading: analyticsLoading } = useAnalyticsStore();

  // Load data
  React.useEffect(() => {
    if (authenticated && ready) {
      const loadData = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            await Promise.all([fetchAgents(token), fetchEvents(token)]);
          }
        } catch (error) {
          console.error("[AnalyticsPage] Failed to load data:", error);
        }
      };
      loadData();
    }
  }, [authenticated, ready, getAccessToken, fetchAgents, fetchEvents]);

  // Calculate analytics when agents and events are loaded
  React.useEffect(() => {
    if (agents.length > 0 || events.length > 0) {
      calculateAnalytics(agents, events);
    }
  }, [agents, events, calculateAnalytics]);

  if (agentsLoading || eventsLoading || analyticsLoading || !analytics) {
    return (
      <>
        <Header title="Analytics" />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 w-3/4 bg-bg-secondary rounded mb-2" />
                    <div className="h-6 w-1/2 bg-bg-secondary rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Analytics" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Payment Analytics
            </h2>
            <p className="text-text-secondary">
              Analyze payment data and x402 protocol usage
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <PaymentStatsCard
              title="Total Volume (Week)"
              value={analytics.totalVolume.week}
              icon={<DollarSign className="h-5 w-5 text-accent-primary" />}
            />
            <PaymentStatsCard
              title="Success Rate"
              value={`${analytics.successRate.toFixed(1)}%`}
              icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            />
            <PaymentStatsCard
              title="x402 Usage Rate"
              value={`${analytics.x402UsageRate.toFixed(1)}%`}
              icon={<Zap className="h-5 w-5 text-accent-primary" />}
            />
            <PaymentStatsCard
              title="Active Channels"
              value={analytics.activeChannels}
              icon={<TrendingUp className="h-5 w-5 text-info" />}
            />
          </div>

          {/* Volume Breakdown */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <PaymentStatsCard
              title="Today"
              value={analytics.totalVolume.today}
              subtitle="Total volume today"
            />
            <PaymentStatsCard
              title="This Week"
              value={analytics.totalVolume.week}
              subtitle="Total volume this week"
            />
            <PaymentStatsCard
              title="This Month"
              value={analytics.totalVolume.month}
              subtitle="Total volume this month"
            />
          </div>

          {/* Transaction Statistics */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <PaymentStatsCard
              title="x402 Transactions"
              value={analytics.x402Transactions}
              subtitle="Total x402 protocol calls"
            />
            <PaymentStatsCard
              title="Completed"
              value={analytics.completedTransactions}
              subtitle="Successful transactions"
            />
            <PaymentStatsCard
              title="Pending Approvals"
              value={analytics.pendingApprovals}
              subtitle="Awaiting approval"
            />
          </div>

          {/* Transactions by Merchant */}
          {Object.keys(analytics.transactionsByMerchant).length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Transactions by Merchant
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.transactionsByMerchant)
                    .sort((a, b) => b[1].volume - a[1].volume)
                    .map(([merchant, stats]) => (
                      <div
                        key={merchant}
                        className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {merchant}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {stats.count} transactions
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-text-primary">
                          {formatCurrency(stats.volume)}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions by Channel */}
          {Object.keys(analytics.transactionsByChannel).length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Transactions by Channel
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.transactionsByChannel)
                    .sort((a, b) => b[1].volume - a[1].volume)
                    .map(([channelId, stats]) => {
                      const channel = agents.find((a) => a.id === channelId);
                      return (
                        <div
                          key={channelId}
                          className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary"
                        >
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {channel?.name || channelId}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {stats.count} transactions
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-text-primary">
                            {formatCurrency(stats.volume)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
