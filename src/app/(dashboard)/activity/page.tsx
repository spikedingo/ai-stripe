"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Bot,
  Zap,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingDown,
  ShoppingCart,
  Filter,
  Search,
  ExternalLink,
  Utensils,
  Plane,
  Calendar,
  LogIn,
} from "lucide-react";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useActivityStore } from "@/stores/activity-store";
import { useAgentStore } from "@/stores";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import type { ActivityType } from "@/types";
import { ChevronDown } from "lucide-react";

const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  agent_created: { icon: Bot, color: "text-info", bgColor: "bg-info/10" },
  agent_updated: { icon: Bot, color: "text-info", bgColor: "bg-info/10" },
  tool_call: { icon: Zap, color: "text-warning", bgColor: "bg-warning/10" },
  payment_402: { icon: CreditCard, color: "text-accent-primary", bgColor: "bg-accent-primary/10" },
  approval_requested: { icon: AlertCircle, color: "text-warning", bgColor: "bg-warning/10" },
  approval_granted: { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
  approval_rejected: { icon: XCircle, color: "text-error", bgColor: "bg-error/10" },
  transaction_completed: { icon: ShoppingCart, color: "text-success", bgColor: "bg-success/10" },
  wishlist_added: { icon: ShoppingCart, color: "text-info", bgColor: "bg-info/10" },
  price_alert: { icon: TrendingDown, color: "text-warning", bgColor: "bg-warning/10" },
  auto_purchase: { icon: ShoppingCart, color: "text-success", bgColor: "bg-success/10" },
  // Demo B: Food Delivery
  food_order_started: { icon: Utensils, color: "text-info", bgColor: "bg-info/10" },
  food_order_placed: { icon: Utensils, color: "text-success", bgColor: "bg-success/10" },
  food_order_delivered: { icon: Utensils, color: "text-accent-primary", bgColor: "bg-accent-primary/10" },
  restaurant_search: { icon: Utensils, color: "text-warning", bgColor: "bg-warning/10" },
  login_required: { icon: LogIn, color: "text-error", bgColor: "bg-error/10" },
  // Demo C: Flight Booking
  flight_search: { icon: Plane, color: "text-info", bgColor: "bg-info/10" },
  flight_selected: { icon: Plane, color: "text-warning", bgColor: "bg-warning/10" },
  flight_booked: { icon: Plane, color: "text-success", bgColor: "bg-success/10" },
  calendar_checked: { icon: Calendar, color: "text-info", bgColor: "bg-info/10" },
};

const filterOptions = [
  { value: "all", label: "All Events" },
  { value: "payments", label: "Payments" },
  { value: "approvals", label: "Approvals" },
  { value: "agents", label: "Agents" },
  { value: "alerts", label: "Alerts" },
];

export default function ActivityPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { events, isLoading, fetchEvents } = useActivityStore();
  const { agents, fetchAgents } = useAgentStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(null);
  const [showAgentSelector, setShowAgentSelector] = React.useState(false);
  const agentSelectorRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        agentSelectorRef.current &&
        !agentSelectorRef.current.contains(event.target as Node)
      ) {
        setShowAgentSelector(false);
      }
    };

    if (showAgentSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAgentSelector]);

  // Load agents on mount
  React.useEffect(() => {
    if (authenticated && ready) {
      const loadAgents = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            await fetchAgents(token);
          }
        } catch (error) {
          console.error("[ActivityPage] Failed to load agents:", error);
        }
      };
      loadAgents();
    }
  }, [authenticated, ready, getAccessToken, fetchAgents]);

  // Auto-select first agent when agents are loaded
  React.useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  // Fetch events when agent changes
  React.useEffect(() => {
    const loadEvents = async () => {
      if (!selectedAgentId) {
        // No agent selected, clear events
        return;
      }
      
      try {
        const token = await getAccessToken();
        if (token) {
          await fetchEvents(token, selectedAgentId);
        }
      } catch (error) {
        console.error("[ActivityPage] Failed to load events:", error);
      }
    };
    
    if (authenticated && ready && selectedAgentId) {
      loadEvents();
    }
  }, [authenticated, ready, selectedAgentId, getAccessToken, fetchEvents]);

  const filteredEvents = React.useMemo(() => {
    let filtered = events;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.agentName?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeFilter !== "all") {
      const filterMap: Record<string, ActivityType[]> = {
        payments: ["payment_402", "transaction_completed"],
        approvals: ["approval_requested", "approval_granted", "approval_rejected"],
        agents: ["agent_created", "agent_updated"],
        alerts: ["price_alert", "wishlist_added"],
      };
      const allowedTypes = filterMap[activeFilter] || [];
      filtered = filtered.filter((event) => allowedTypes.includes(event.type));
    }

    return filtered;
  }, [events, searchQuery, activeFilter]);

  // Group events by date
  const groupedEvents = React.useMemo(() => {
    const groups: Record<string, typeof events> = {};

    filteredEvents.forEach((event) => {
      const date = new Date(event.createdAt);
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
          year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });

    return groups;
  }, [filteredEvents]);

  return (
    <>
      <Header title="Activity" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Activity Feed</h2>
            <p className="text-text-secondary">
              Track all agent actions, payments, and approvals
            </p>
          </div>

          {/* Agent Selector */}
          <div className="mb-6">
            <div className="relative" ref={agentSelectorRef}>
              <button
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="w-full sm:w-auto min-w-[200px] flex items-center justify-between gap-2 px-4 py-2 rounded-lg border border-border-default hover:border-border-hover bg-bg-secondary hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Bot className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                  <span className="text-sm font-medium text-text-primary truncate">
                    {selectedAgentId
                      ? agents.find((a) => a.id === selectedAgentId)?.name || "Select Agent"
                      : "Select Agent"}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-text-tertiary transition-transform flex-shrink-0 ${
                    showAgentSelector ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Agent Dropdown */}
              {showAgentSelector && (
                <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 w-full sm:w-auto min-w-[200px] bg-bg-tertiary border border-border-subtle rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {agents.length > 0 ? (
                    agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setShowAgentSelector(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-bg-hover transition-colors ${
                          selectedAgentId === agent.id ? "bg-bg-hover" : ""
                        }`}
                      >
                        <Bot className="h-4 w-4 text-accent-primary" />
                        <span className="text-text-primary truncate">{agent.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-text-tertiary">
                      No agents available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Search events..."
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

          {/* Events List */}
          {!selectedAgentId ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Select an Agent
                </h3>
                <p className="text-text-secondary">
                  Please select an agent from the dropdown above to view their activities
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
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
          ) : filteredEvents.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Filter className="h-6 w-6 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No events found
                </h3>
                <p className="text-text-secondary">
                  {searchQuery || activeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Your activity feed will show up here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-text-tertiary mb-3">{date}</h3>
                  <div className="space-y-3">
                    {dateEvents.map((event) => {
                      const config = activityConfig[event.type];
                      const Icon = config.icon;

                      return (
                        <Card key={event.id} className="hover:border-border-default transition-colors">
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
                                      {event.title}
                                    </p>
                                    <p className="text-sm text-text-secondary mt-0.5">
                                      {event.description}
                                    </p>
                                  </div>
                                  <span className="text-xs text-text-tertiary whitespace-nowrap">
                                    {formatRelativeTime(event.createdAt)}
                                  </span>
                                </div>

                                {/* Metadata */}
                                {event.metadata && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {"amount" in event.metadata && event.metadata.amount !== undefined && (
                                      <Badge variant="outline">
                                        {formatCurrency(Number(event.metadata.amount))}
                                      </Badge>
                                    )}
                                    {"txHash" in event.metadata && event.metadata.txHash ? (
                                      <Badge
                                        variant="outline"
                                        className="cursor-pointer hover:bg-bg-hover"
                                      >
                                        <span className="truncate max-w-[100px]">
                                          {String(event.metadata.txHash)}
                                        </span>
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </Badge>
                                    ) : null}
                                    {"merchant" in event.metadata && event.metadata.merchant ? (
                                      <Badge variant="outline">
                                        {String(event.metadata.merchant)}
                                      </Badge>
                                    ) : null}
                                    {"tool" in event.metadata && event.metadata.tool ? (
                                      <Badge variant="info">
                                        {String(event.metadata.tool)}
                                      </Badge>
                                    ) : null}
                                  </div>
                                )}

                                {/* Agent Badge */}
                                {event.agentName && (
                                  <div className="mt-2">
                                    <Badge variant="default" className="text-xs">
                                      <Bot className="h-3 w-3 mr-1" />
                                      {event.agentName}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

