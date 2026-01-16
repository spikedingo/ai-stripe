"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Store, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgentStore, useActivityStore, useMerchantStore } from "@/stores";
import type { Merchant } from "@/stores/merchant-store";
import { X402Badge } from "@/components/payment/x402-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default function MerchantsPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { agents, fetchAgents, isLoading: agentsLoading } = useAgentStore();
  const { events, fetchEvents, isLoading: eventsLoading } = useActivityStore();
  const { merchants, fetchMerchants, isLoading: merchantsLoading } = useMerchantStore();

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
          console.error("[MerchantsPage] Failed to load data:", error);
        }
      };
      loadData();
    }
  }, [authenticated, ready, getAccessToken, fetchAgents, fetchEvents]);

  // Fetch merchants when agents and events are loaded
  React.useEffect(() => {
    if (agents.length > 0 || events.length > 0) {
      fetchMerchants(agents, events);
    }
  }, [agents, events, fetchMerchants]);

  const getStatusIcon = (status: Merchant["integrationStatus"]) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-error" />;
    }
  };

  const getStatusColor = (status: Merchant["integrationStatus"]) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "inactive":
        return "error";
    }
  };

  return (
    <>
      <Header title="Merchants" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Merchants</h2>
            <p className="text-text-secondary">
              Manage merchant integrations and configurations
            </p>
          </div>

          {/* Merchants Grid */}
          {agentsLoading || eventsLoading || merchantsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 w-3/4 bg-bg-secondary rounded mb-4" />
                    <div className="h-3 w-1/2 bg-bg-secondary rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : merchants.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {merchants.map((merchant) => (
                <Card key={merchant.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
                          <Store className="h-5 w-5 text-accent-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{merchant.name}</CardTitle>
                          <p className="text-xs text-text-tertiary mt-1">
                            {merchant.domain}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(merchant.integrationStatus)}
                          <span className="text-sm text-text-secondary">Status</span>
                        </div>
                        <Badge variant={getStatusColor(merchant.integrationStatus)}>
                          {merchant.integrationStatus}
                        </Badge>
                      </div>

                      {/* x402 Support */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">x402 Protocol</span>
                        {merchant.x402Supported ? (
                          <X402Badge />
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Not Supported
                          </Badge>
                        )}
                      </div>

                      {/* Statistics */}
                      <div className="pt-3 border-t border-border-subtle space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-tertiary">Transactions</span>
                          <span className="text-text-primary font-medium">
                            {merchant.transactionCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-tertiary">Total Volume</span>
                          <span className="text-text-primary font-medium">
                            {formatCurrency(merchant.totalVolume)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-tertiary">Channels</span>
                          <span className="text-text-primary font-medium">
                            {merchant.channels.length}
                          </span>
                        </div>
                      </div>

                      {/* Last Transaction */}
                      {merchant.lastTransactionAt && (
                        <div className="pt-2 border-t border-border-subtle">
                          <p className="text-xs text-text-tertiary">
                            Last transaction: {formatRelativeTime(merchant.lastTransactionAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No merchants found
                </h3>
                <p className="text-text-secondary">
                  Merchants will appear here once payment channels are configured
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
