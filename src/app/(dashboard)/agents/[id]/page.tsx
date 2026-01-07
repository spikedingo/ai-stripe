"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAgentStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";
import type { Agent, AgentPermissions, AgentBudget } from "@/types";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { agents, updateAgent, deleteAgent, isLoading } = useAgentStore();

  const agent = agents.find((a) => a.id === params.id);

  const [formData, setFormData] = React.useState<{
    name: string;
    description: string;
    permissions: AgentPermissions;
    budget: AgentBudget;
    allowedMerchants: string[];
  }>({
    name: "",
    description: "",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 100,
      requireApprovalAbove: 50,
      allowedCategories: [],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 100,
      weeklyLimit: 500,
      monthlyLimit: 1000,
      perMerchantLimit: 200,
      spent: { daily: 0, weekly: 0, monthly: 0 },
    },
    allowedMerchants: [],
  });

  const [merchantInput, setMerchantInput] = React.useState("");

  React.useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description,
        permissions: agent.permissions,
        budget: agent.budget,
        allowedMerchants: agent.allowedMerchants,
      });
    }
  }, [agent]);

  if (!agent) {
    return (
      <>
        <Header title="Agent Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary mb-4">Agent not found</p>
            <Button onClick={() => router.push("/agents")}>Back to Agents</Button>
          </div>
        </div>
      </>
    );
  }

  const handleSave = async () => {
    await updateAgent(agent.id, formData);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this agent?")) {
      await deleteAgent(agent.id);
      router.push("/agents");
    }
  };

  const addMerchant = () => {
    if (merchantInput && !formData.allowedMerchants.includes(merchantInput)) {
      setFormData({
        ...formData,
        allowedMerchants: [...formData.allowedMerchants, merchantInput],
      });
      setMerchantInput("");
    }
  };

  const removeMerchant = (merchant: string) => {
    setFormData({
      ...formData,
      allowedMerchants: formData.allowedMerchants.filter((m) => m !== merchant),
    });
  };

  return (
    <>
      <Header title="Agent Settings" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => router.push("/agents")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{agent.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    agent.status === "active"
                      ? "success"
                      : agent.status === "paused"
                      ? "warning"
                      : "error"
                  }
                >
                  {agent.status}
                </Badge>
                <span className="text-text-tertiary text-sm">
                  Template: {agent.template.replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="merchants">Merchants</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your agent&apos;s name and description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Permissions</CardTitle>
                  <CardDescription>Configure what this agent can do</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Toggle Permissions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary">
                      <div>
                        <p className="font-medium text-text-primary">Read Pages</p>
                        <p className="text-sm text-text-tertiary">
                          Allow agent to browse and read product pages
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.permissions.canReadPages}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                canReadPages: e.target.checked,
                              },
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-bg-tertiary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary">
                      <div>
                        <p className="font-medium text-text-primary">Auto-Checkout</p>
                        <p className="text-sm text-text-tertiary">
                          Allow agent to complete purchases automatically
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.permissions.canCheckout}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                canCheckout: e.target.checked,
                              },
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-bg-tertiary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                      </label>
                    </div>
                  </div>

                  {/* Numeric Limits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">
                        Max Transaction Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          value={formData.permissions.maxTransactionAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                maxTransactionAmount: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">
                        Require Approval Above
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          value={formData.permissions.requireApprovalAbove}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                requireApprovalAbove: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Limits</CardTitle>
                  <CardDescription>Set spending limits for this agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">
                        Daily Limit
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          value={formData.budget.dailyLimit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              budget: {
                                ...formData.budget,
                                dailyLimit: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                      <p className="text-xs text-text-tertiary">
                        Spent today: {formatCurrency(formData.budget.spent.daily)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">
                        Weekly Limit
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          value={formData.budget.weeklyLimit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              budget: {
                                ...formData.budget,
                                weeklyLimit: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                      <p className="text-xs text-text-tertiary">
                        Spent this week: {formatCurrency(formData.budget.spent.weekly)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">
                        Monthly Limit
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          value={formData.budget.monthlyLimit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              budget: {
                                ...formData.budget,
                                monthlyLimit: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                      <p className="text-xs text-text-tertiary">
                        Spent this month: {formatCurrency(formData.budget.spent.monthly)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">
                        Per Merchant Limit
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          value={formData.budget.perMerchantLimit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              budget: {
                                ...formData.budget,
                                perMerchantLimit: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Merchants Tab */}
            <TabsContent value="merchants">
              <Card>
                <CardHeader>
                  <CardTitle>Allowed Merchants</CardTitle>
                  <CardDescription>
                    Specify which merchants this agent can shop from. Leave empty to allow all.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., amazon.com"
                      value={merchantInput}
                      onChange={(e) => setMerchantInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMerchant()}
                    />
                    <Button onClick={addMerchant}>Add</Button>
                  </div>

                  {formData.allowedMerchants.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.allowedMerchants.map((merchant) => (
                        <Badge
                          key={merchant}
                          variant="outline"
                          className="cursor-pointer hover:bg-error/10 hover:text-error hover:border-error"
                          onClick={() => removeMerchant(merchant)}
                        >
                          {merchant} ×
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-tertiary">
                      No merchants specified. Agent can shop from any merchant.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}






