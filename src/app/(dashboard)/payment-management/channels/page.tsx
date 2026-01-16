"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentChannelCard } from "@/components/payment/payment-channel-card";
import { useAgentStore } from "@/stores";
import { mapAgentToChannel } from "@/lib/payment-mapper";
import { Bot } from "lucide-react";

export default function PaymentChannelsPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { agents, tasks, fetchAgents, fetchAgentTasks, isLoading } = useAgentStore();
  const [loadingTasks, setLoadingTasks] = React.useState(false);

  // Load agents
  React.useEffect(() => {
    if (authenticated && ready) {
      const loadData = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            await fetchAgents(token);
          }
        } catch (error) {
          console.error("[PaymentChannelsPage] Failed to load data:", error);
        }
      };
      loadData();
    }
  }, [authenticated, ready, getAccessToken, fetchAgents]);

  // Fetch tasks for agents
  React.useEffect(() => {
    if (authenticated && ready && agents.length > 0) {
      const loadTasks = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            setLoadingTasks(true);
            try {
              await Promise.all(
                agents.map((agent) => fetchAgentTasks(agent.id, token))
              );
            } finally {
              setLoadingTasks(false);
            }
          }
        } catch (error) {
          console.error("[PaymentChannelsPage] Failed to load tasks:", error);
          setLoadingTasks(false);
        }
      };
      loadTasks();
    }
  }, [authenticated, ready, agents, getAccessToken, fetchAgentTasks]);

  // Map agents to payment channels
  const channels = React.useMemo(() => {
    return agents.map((agent) => {
      const agentTasks = tasks[agent.id] || [];
      return mapAgentToChannel(agent, agentTasks);
    });
  }, [agents, tasks]);

  return (
    <>
      <Header title="Payment Channels" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Payment Channels
            </h2>
            <p className="text-text-secondary">
              Configure payment channels and routing rules
            </p>
          </div>

          {/* Channels Grid */}
          {isLoading || loadingTasks ? (
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
          ) : channels.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {channels.map((channel) => (
                <PaymentChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No payment channels yet
                </h3>
                <p className="text-text-secondary">
                  Payment channels will appear here once agents are configured
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
