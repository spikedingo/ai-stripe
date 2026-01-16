"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Settings, Plus } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentStore, usePaymentPolicyStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";

export default function PaymentPoliciesPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { agents, tasks, fetchAgents, fetchAgentTasks, isLoading } = useAgentStore();
  const { policies, fetchPolicies, isLoading: policiesLoading } = usePaymentPolicyStore();
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
          console.error("[PaymentPoliciesPage] Failed to load data:", error);
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
          console.error("[PaymentPoliciesPage] Failed to load tasks:", error);
          setLoadingTasks(false);
        }
      };
      loadTasks();
    }
  }, [authenticated, ready, agents, getAccessToken, fetchAgentTasks]);

  // Fetch policies when agents and tasks are loaded
  React.useEffect(() => {
    if (agents.length > 0) {
      fetchPolicies(agents, tasks);
    }
  }, [agents, tasks, fetchPolicies]);

  return (
    <>
      <Header title="Payment Policies" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Payment Policies
              </h2>
              <p className="text-text-secondary">
                Manage payment strategies and routing rules
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>

          {/* Policies List */}
          {isLoading || loadingTasks || policiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 w-3/4 bg-bg-secondary rounded mb-4" />
                    <div className="h-3 w-1/2 bg-bg-secondary rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : policies.length > 0 ? (
            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        <p className="text-sm text-text-secondary mt-1">
                          {policy.description}
                        </p>
                      </div>
                      <Badge variant="outline">{policy.channelName}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-text-tertiary mb-1">
                          Payment Rules
                        </p>
                        <p className="text-sm font-medium text-text-primary">
                          {policy.paymentRules.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary mb-1">
                          Max Transaction
                        </p>
                        <p className="text-sm font-medium text-text-primary">
                          {formatCurrency(policy.transactionLimits.maxAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary mb-1">
                          Approval Threshold
                        </p>
                        <p className="text-sm font-medium text-text-primary">
                          {formatCurrency(
                            policy.transactionLimits.requireApprovalAbove
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary mb-1">
                          Weekly Limit
                        </p>
                        <p className="text-sm font-medium text-text-primary">
                          {formatCurrency(policy.transactionLimits.weeklyLimit)}
                        </p>
                      </div>
                    </div>

                    {policy.merchantWhitelist.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-text-tertiary mb-2">
                          Merchant Whitelist
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {policy.merchantWhitelist.map((merchant) => (
                            <Badge key={merchant} variant="outline" className="text-xs">
                              {merchant}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {policy.paymentRules.length > 0 && (
                      <div>
                        <p className="text-xs text-text-tertiary mb-2">
                          Payment Rules
                        </p>
                        <div className="space-y-2">
                          {policy.paymentRules.map((rule) => (
                            <div
                              key={rule.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-bg-secondary"
                            >
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  {rule.name}
                                </p>
                                {rule.schedule && (
                                  <p className="text-xs text-text-tertiary">
                                    {rule.schedule}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={rule.enabled ? "success" : "default"}
                                className="text-xs"
                              >
                                {rule.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <Button variant="secondary" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Policy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No payment policies yet
                </h3>
                <p className="text-text-secondary mb-4">
                  Payment policies will be created automatically from your payment channels
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Policy
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
