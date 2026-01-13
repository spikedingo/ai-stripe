"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Plus, Bot, MoreVertical, Play, Pause, Trash2, Settings, TrendingUp } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgentStore } from "@/stores";
import { formatRelativeTime, formatCurrency } from "@/lib/utils";
import type { AgentStatus, Template } from "@/types";

function AgentsContent() {
  const searchParams = useSearchParams();
  const showCreate = searchParams.get("action") === "create";
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { 
    agents, 
    templates,
    updateAgentStatus, 
    deleteAgent, 
    isLoading,
    fetchAgents,
    fetchTemplates,
    createAgentFromTemplate,
  } = useAgentStore();

  const [showCreateDialog, setShowCreateDialog] = React.useState(showCreate);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const [agentName, setAgentName] = React.useState("");
  const [agentDescription, setAgentDescription] = React.useState("");
  const [weeklyLimit, setWeeklyLimit] = React.useState(100);
  const [extraPrompt, setExtraPrompt] = React.useState("");
  const [showMenu, setShowMenu] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authenticated && ready) {
      const loadData = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            await fetchAgents(token);
            await fetchTemplates(token);
          }
        } catch (error) {
          console.error("[AgentsPage] Failed to load data:", error);
        }
      };
      loadData();
    }
  }, [authenticated, ready, getAccessToken, fetchAgents, fetchTemplates]);

  React.useEffect(() => {
    if (selectedTemplate?.default_settings?.weekly_spending_limit) {
      setWeeklyLimit(selectedTemplate.default_settings.weekly_spending_limit);
    }
  }, [selectedTemplate]);

  const handleCreateAgent = async () => {
    if (!selectedTemplate || !agentName) return;

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }
      
      await createAgentFromTemplate(selectedTemplate.id, {
        name: agentName,
        description: agentDescription,
        weekly_spending_limit: weeklyLimit,
        extra_prompt: extraPrompt,
      }, token);
      
      setShowCreateDialog(false);
      setSelectedTemplate(null);
      setAgentName("");
      setAgentDescription("");
      setExtraPrompt("");
      
      // Refresh agents list
      await fetchAgents(token);
    } catch (error) {
      console.error("[AgentsPage] Failed to create agent:", error);
      alert("Failed to create agent. Please try again.");
    }
  };

  const handleStatusToggle = async (agentId: string, currentStatus: AgentStatus) => {
    const newStatus: AgentStatus = currentStatus === "active" ? "paused" : "active";
    await updateAgentStatus(agentId, newStatus);
    setShowMenu(null);
  };

  const handleDelete = async (agentId: string) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error("Failed to get access token");
        }
        await deleteAgent(agentId, token);
        setShowMenu(null);
        // Refresh agents list
        await fetchAgents(token);
      } catch (error) {
        console.error("[AgentsPage] Failed to delete agent:", error);
        alert("Failed to delete agent. Please try again.");
      }
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "stopped":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <Header title="Agents" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Your Agents</h2>
              <p className="text-text-secondary">
                Manage your AI shopping agents and their permissions
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>

          {/* Agents Grid */}
          {agents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          fallback={agent.name[0]}
                          size="lg"
                          className="bg-accent-primary/10 text-accent-primary"
                        />
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <Badge variant={getStatusColor(agent.status)} className="mt-1">
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowMenu(showMenu === agent.id ? null : agent.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {showMenu === agent.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-bg-tertiary border border-border-subtle rounded-lg shadow-lg z-10">
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-hover"
                              onClick={() => handleStatusToggle(agent.id, agent.status)}
                            >
                              {agent.status === "active" ? (
                                <>
                                  <Pause className="h-4 w-4" />
                                  Pause Agent
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4" />
                                  Resume Agent
                                </>
                              )}
                            </button>
                            <Link href={`/agents/${agent.id}`}>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-hover">
                                <Settings className="h-4 w-4" />
                                Configure
                              </button>
                            </Link>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-bg-hover"
                              onClick={() => handleDelete(agent.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2">
                      {agent.description}
                    </CardDescription>

                    {/* Stats */}
                    <div className="space-y-2 text-sm">
                      {agent.budget && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-text-tertiary">Weekly Budget</span>
                            <span className="text-text-primary">
                              {formatCurrency(agent.budget.spent?.weekly || 0)} /{" "}
                              {formatCurrency(agent.budget.weeklyLimit || agent.budget.dailyLimit * 7)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-primary rounded-full"
                              style={{
                                width: `${Math.min(
                                  ((agent.budget.spent?.weekly || 0) / (agent.budget.weeklyLimit || agent.budget.dailyLimit * 7)) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </>
                      )}
                      {agent.permissions && (
                        <div className="flex items-center justify-between text-text-tertiary">
                          <span>Approval threshold</span>
                          <span>{formatCurrency(agent.permissions.requireApprovalAbove || 0)}</span>
                        </div>
                      )}
                      {agent.lastActiveAt && (
                        <div className="flex items-center gap-1 text-text-tertiary">
                          <TrendingUp className="h-3 w-3" />
                          <span>Active {formatRelativeTime(agent.lastActiveAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Link href={`/chat?agent=${agent.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full">
                          Start Chat
                        </Button>
                      </Link>
                      <Link href={`/agents/${agent.id}`}>
                        <Button variant="ghost" size="icon-sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No agents yet
                </h3>
                <p className="text-text-secondary mb-4">
                  Create your first AI shopping agent from a template to get started
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Agent
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>
              Choose a template to get started or create a custom agent
            </DialogDescription>
          </DialogHeader>

          {!selectedTemplate ? (
            <div className="grid grid-cols-2 gap-3 py-4">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <button
                    key={template.id}
                    className="p-4 text-left rounded-lg border border-border-default hover:border-accent-primary hover:bg-bg-hover transition-colors"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <span className="text-2xl mb-2 block">{template.icon}</span>
                    <p className="font-medium text-text-primary">{template.name}</p>
                    <p className="text-sm text-text-tertiary mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-text-tertiary">
                  <p>Loading templates...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  className="text-accent-primary hover:underline text-sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ← Change template
                </button>
                <Badge variant="outline">{selectedTemplate.name}</Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Agent Name *</label>
                <Input
                  placeholder="e.g., My Shopping Assistant"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Description (optional)
                </label>
                <Textarea
                  placeholder="What should this agent do?"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Weekly Spending Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                    $
                  </span>
                  <Input
                    type="number"
                    className="pl-7"
                    value={weeklyLimit}
                    onChange={(e) => setWeeklyLimit(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Additional Instructions (optional)
                </label>
                <Textarea
                  placeholder="e.g., Focus on electronics under $100, prefer Amazon..."
                  value={extraPrompt}
                  onChange={(e) => setExtraPrompt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-text-tertiary">
                  These instructions will be added to the agent&apos;s default behavior
                </p>
              </div>

              <div className="bg-bg-secondary rounded-lg p-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">
                  Default Behavior
                </h4>
                {selectedTemplate?.prompt_structure && (
                <p className="text-sm text-text-tertiary">
                  {selectedTemplate.prompt_structure}
                </p>
                )}
                {selectedTemplate?.default_settings?.check_frequency && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <p className="text-xs text-text-tertiary">
                    Check frequency: {selectedTemplate.default_settings.check_frequency}
                  </p>
                </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            {selectedTemplate && (
              <Button onClick={handleCreateAgent} disabled={!agentName || isLoading}>
                {isLoading ? "Creating..." : "Create Agent"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AgentsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <AgentsContent />
    </React.Suspense>
  );
}
