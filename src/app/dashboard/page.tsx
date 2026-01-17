"use client";

import * as React from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { 
  ShoppingCart, 
  Bot, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Package,
  PlayCircle,
  Bell,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Header } from "@/components/shared/header";
import { useAuthStore, useBalanceStore, useAgentStore, useActivityStore } from "@/stores";
import { formatUSDC, formatRelativeTime } from "@/lib/utils";
import { useUserWallet } from "@/hooks";
import type { ActivityType } from "@/types";

// Activity type icon mapping
const activityIcons: Record<ActivityType, React.ElementType> = {
  agent_created: Bot,
  agent_updated: Bot,
  tool_call: Zap,
  payment_402: DollarSign,
  approval_requested: Bell,
  approval_granted: CheckCircle2,
  approval_rejected: AlertCircle,
  transaction_completed: CheckCircle2,
  wishlist_added: Package,
  price_alert: TrendingUp,
  auto_purchase: ShoppingCart,
  food_order_started: ShoppingCart,
  food_order_placed: ShoppingCart,
  food_order_delivered: CheckCircle2,
  restaurant_search: Zap,
  login_required: AlertCircle,
  flight_search: Zap,
  flight_selected: PlayCircle,
  flight_booked: CheckCircle2,
  calendar_checked: Calendar,
};

// Activity type color mapping
const activityColors: Record<ActivityType, string> = {
  agent_created: "text-info",
  agent_updated: "text-info",
  tool_call: "text-accent-primary",
  payment_402: "text-accent-primary",
  approval_requested: "text-warning",
  approval_granted: "text-success",
  approval_rejected: "text-error",
  transaction_completed: "text-success",
  wishlist_added: "text-info",
  price_alert: "text-warning",
  auto_purchase: "text-success",
  food_order_started: "text-info",
  food_order_placed: "text-success",
  food_order_delivered: "text-success",
  restaurant_search: "text-accent-primary",
  login_required: "text-warning",
  flight_search: "text-accent-primary",
  flight_selected: "text-info",
  flight_booked: "text-success",
  calendar_checked: "text-info",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { agents, fetchAgents, tasks, fetchAgentTasks } = useAgentStore();
  const { events, fetchEvents, isLoading } = useActivityStore();
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { data: walletData, isLoading: walletLoading } = useUserWallet();
  const [loadingTasks, setLoadingTasks] = React.useState(false);
  const tasksLoadedRef = React.useRef<Set<string>>(new Set());
  const agentsLoadedRef = React.useRef(false);
  const loadingRef = React.useRef(false);
  
  // Get USDC balance from wallet data (same as sidebar)
  const usdcBalance = walletData?.usdc_balance || "0.0";

  const activeAgents = agents.filter((a) => a.status === "active");

  // Filter agents that have enabled tasks (for reference)
  const workingAgents = React.useMemo(() => {
    return activeAgents.filter((agent) => {
      const agentTasks = tasks[agent.id] || [];
      return agentTasks.some((task) => task.enabled);
    });
  }, [activeAgents, tasks]);

  // Helper to check if agent has enabled tasks
  const hasEnabledTasks = (agentId: string) => {
    const agentTasks = tasks[agentId] || [];
    return agentTasks.some((task) => task.enabled);
  };

  // Load agents and events (only once when authenticated)
  React.useEffect(() => {
    if (authenticated && ready && !agentsLoadedRef.current && !loadingRef.current) {
      loadingRef.current = true;
      const loadData = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            agentsLoadedRef.current = true;
            await fetchAgents(token);
            await fetchEvents(token);
          }
        } catch (error) {
          console.error("[Dashboard] Failed to load data:", error);
          agentsLoadedRef.current = false; // Allow retry on error
        } finally {
          loadingRef.current = false;
        }
      };
      loadData();
    }
  }, [authenticated, ready, getAccessToken, fetchAgents, fetchEvents]);

  // Poll timeline events every 5 minutes (don't poll immediately since we already loaded it above)
  React.useEffect(() => {
    if (!authenticated || !ready) return;

    const pollTimeline = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          console.log("[Dashboard] Polling timeline events...");
          await fetchEvents(token);
        }
      } catch (error) {
        console.error("[Dashboard] Failed to poll timeline:", error);
      }
    };

    // Don't poll immediately - we already loaded events in the initial load above
    // Start polling after 5 minutes, then every 5 minutes
    const intervalId = setInterval(pollTimeline, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [authenticated, ready, getAccessToken, fetchEvents]);

  // Fetch tasks for active agents after agents are loaded (only once per agent)
  React.useEffect(() => {
    if (authenticated && ready && agents.length > 0) {
      const loadTasks = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            const active = agents.filter((a) => a.status === "active");
            // Only load tasks for agents that don't have tasks loaded yet
            // Check both the ref and the tasks store to avoid duplicate calls
            const agentsToLoad = active.filter(
              (agent) => !tasksLoadedRef.current.has(agent.id) && !tasks[agent.id]
            );
            
            if (agentsToLoad.length === 0) return;
            
            setLoadingTasks(true);
            try {
              await Promise.all(
                agentsToLoad.map(async (agent) => {
                  tasksLoadedRef.current.add(agent.id);
                  try {
                    await fetchAgentTasks(agent.id, token);
                  } catch (error) {
                    console.error(`[Dashboard] Failed to load tasks for agent ${agent.id}:`, error);
                    tasksLoadedRef.current.delete(agent.id); // Allow retry on error
                  }
                })
              );
            } finally {
              setLoadingTasks(false);
            }
          }
        } catch (error) {
          console.error("[Dashboard] Failed to load tasks:", error);
          setLoadingTasks(false);
        }
      };
      loadTasks();
    }
  }, [authenticated, ready, agents, tasks, getAccessToken, fetchAgentTasks]);

  return (
    <>
      <Header title="Dashboard" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h2>
            <p className="text-text-secondary">
              Here&apos;s what&apos;s happening with your AI agents.
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
                    <Wallet className="h-5 w-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Balance</p>
                    <p className="text-xl font-semibold text-text-primary">
                      {walletLoading ? (
                        <span className="text-text-tertiary">Loading...</span>
                      ) : (
                        formatUSDC(parseFloat(usdcBalance))
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                    <Bot className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Your AI Agents</p>
                    <p className="text-xl font-semibold text-text-primary">{activeAgents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Events Today</p>
                    <p className="text-xl font-semibold text-text-primary">{events.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Agents Section or Onboarding */}
          {loadingTasks ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-accent-primary border-t-transparent rounded-full" />
                </div>
              </CardContent>
            </Card>
          ) : activeAgents.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Your AI Agents</CardTitle>
                  <Link href="/agents">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {activeAgents.slice(0, 5).map((agent) => {
                    const hasEnabled = hasEnabledTasks(agent.id);
                    const agentTasks = tasks[agent.id] || [];
                    return (
                      <Link key={agent.id} href={`/agents/${agent.id}`}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-secondary hover:bg-bg-hover transition-colors cursor-pointer border border-border-subtle">
                          <Avatar
                            fallback={agent.name[0]}
                            size="sm"
                            className="bg-accent-primary/10 text-accent-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-text-primary">{agent.name}</p>
                              {hasEnabled ? (
                                <Badge variant="success" className="text-xs">
                                  Running
                                </Badge>
                              ) : agentTasks.length > 0 ? (
                                <Badge variant="outline" className="text-xs">
                                  Paused
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-text-tertiary">
                              {agent.lastActiveAt
                                ? `Active ${formatRelativeTime(agent.lastActiveAt)}`
                                : agentTasks.length > 0
                                ? `${agentTasks.length} task${agentTasks.length > 1 ? "s" : ""}`
                                : "No tasks"}
                            </p>
                          </div>
                          <Badge variant="success" className="ml-2">
                            {agent.status}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-accent-primary/5 to-info/5 border-accent-primary/20">
              <CardContent className="py-8 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-accent-primary/10 flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-accent-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Get Started with AI Agents
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Create your first AI shopping agent from our templates. Let AI handle your
                  purchases, find deals, and automate your shopping workflow.
                </p>
                <Link href="/agents?action=create">
                  <Button size="lg">
                    <Bot className="h-5 w-5 mr-2" />
                    Create Your First Agent
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Timeline Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Activity Timeline</h3>
              <Link href="/activity">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full" />
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-3">
                {events.slice(0, 10).map((event) => {
                  const Icon = activityIcons[event.type as ActivityType] || Clock;
                  const colorClass = activityColors[event.type as ActivityType] || "text-text-secondary";

                  return (
                    <Card
                      key={event.id}
                      className="hover:border-accent-primary/30 transition-colors cursor-pointer"
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary flex-shrink-0`}
                          >
                            <Icon className={`h-5 w-5 ${colorClass}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-text-primary mb-0.5">
                                  {event.title}
                                </h4>
                                {event.agentName && (
                                  <Link href={`/agents/${event.agentId}`}>
                                    <Badge
                                      variant="outline"
                                      className="text-xs hover:bg-bg-hover"
                                    >
                                      <Bot className="h-3 w-3 mr-1" />
                                      {event.agentName}
                                    </Badge>
                                  </Link>
                                )}
                              </div>
                              <span className="text-xs text-text-tertiary whitespace-nowrap">
                                {formatRelativeTime(event.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary">{event.description}</p>

                            {/* Metadata */}
                            {event.metadata && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {event.metadata.amount && typeof event.metadata.amount === 'number' ? (
                                  <Badge variant="outline" className="text-xs">
                                    ${event.metadata.amount.toFixed(2)}
                                  </Badge>
                                ) : null}
                                {event.metadata.merchant && typeof event.metadata.merchant === 'string' ? (
                                  <Badge variant="outline" className="text-xs">
                                    {event.metadata.merchant}
                                  </Badge>
                                ) : null}
                                {event.metadata.tool && typeof event.metadata.tool === 'string' ? (
                                  <Badge variant="outline" className="text-xs">
                                    {event.metadata.tool}
                                  </Badge>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-text-tertiary mb-4" />
                  <p className="text-text-secondary">No activity yet</p>
                  <p className="text-sm text-text-tertiary mt-1">
                    Your agent activity will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
