"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCart, Bot, TrendingUp, Zap, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/shared/header";
import { useAuthStore, useBalanceStore, useAgentStore } from "@/stores";
import { formatUSDC, formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balance, transactions } = useBalanceStore();
  const { agents } = useAgentStore();

  const activeAgents = agents.filter((a) => a.status === "active").length;
  const recentTransactions = transactions.slice(0, 3);

  return (
    <>
      <Header title="Dashboard" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h2>
            <p className="text-text-secondary">
              Here&apos;s an overview of your AI agents and recent activity.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Balance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Available Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-text-tertiary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">
                  {formatUSDC(balance.available)}
                </div>
                <Link href="/settings?tab=billing">
                  <Button variant="link" className="p-0 h-auto text-sm text-accent-primary">
                    Add Funds →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Active Agents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Active Agents
                </CardTitle>
                <Bot className="h-4 w-4 text-text-tertiary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">{activeAgents}</div>
                <p className="text-xs text-text-tertiary">of {agents.length} total</p>
              </CardContent>
            </Card>

            {/* Today's Spend */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Today&apos;s Spend
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-text-tertiary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">$15.99</div>
                <p className="text-xs text-success">↓ 12% from yesterday</p>
              </CardContent>
            </Card>

            {/* API Calls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  API Calls (24h)
                </CardTitle>
                <Zap className="h-4 w-4 text-text-tertiary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">47</div>
                <p className="text-xs text-text-tertiary">x402 protocol</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Trigger Purchase */}
            <Card className="hover:border-accent-primary transition-colors cursor-pointer">
              <Link href="/mock">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10">
                    <ShoppingCart className="h-6 w-6 text-accent-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">Trigger Purchase</CardTitle>
                    <CardDescription>
                      Start a new purchase flow with your AI agent
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-text-tertiary" />
                </CardContent>
              </Link>
            </Card>

            {/* Create Agent */}
            <Card className="hover:border-accent-primary transition-colors cursor-pointer">
              <Link href="/agents?action=create">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                    <Bot className="h-6 w-6 text-info" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">Create New Agent</CardTitle>
                    <CardDescription>
                      Set up a new agent with custom permissions
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-text-tertiary" />
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Link href="/activity">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            tx.type === "deposit"
                              ? "bg-success/10"
                              : "bg-bg-tertiary"
                          }`}
                        >
                          {tx.type === "deposit" ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <Zap className="h-4 w-4 text-text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {tx.description}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {formatRelativeTime(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            tx.type === "deposit"
                              ? "text-success"
                              : "text-text-primary"
                          }`}
                        >
                          {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                        </p>
                        <Badge
                          variant={tx.status === "completed" ? "success" : "warning"}
                          className="text-[10px]"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-tertiary">
                  <p>No transactions yet</p>
                  <Link href="/settings?tab=billing">
                    <Button variant="link" className="mt-2">
                      Add funds to get started
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

