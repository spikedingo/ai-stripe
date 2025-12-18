"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import type { AgentTemplate, AgentStatus } from "@/types";

const agentTemplates: { id: AgentTemplate; name: string; description: string; icon: string }[] = [
  {
    id: "deal_hunter",
    name: "Deal Hunter",
    description: "Monitors prices and automatically purchases when target price is reached",
    icon: "🎯",
  },
  {
    id: "buyer",
    name: "General Buyer",
    description: "General purpose agent for various purchases",
    icon: "🛒",
  },
  {
    id: "subscriber",
    name: "Subscription Manager",
    description: "Manages subscriptions and recurring payments",
    icon: "📅",
  },
  {
    id: "custom",
    name: "Custom Agent",
    description: "Create a fully customized agent from scratch",
    icon: "⚙️",
  },
];

export default function AgentsPage() {
  const searchParams = useSearchParams();
  const showCreate = searchParams.get("action") === "create";
  const { agents, createAgent, updateAgentStatus, deleteAgent, isLoading } = useAgentStore();

  const [showCreateDialog, setShowCreateDialog] = React.useState(showCreate);
  const [selectedTemplate, setSelectedTemplate] = React.useState<AgentTemplate | null>(null);
  const [agentName, setAgentName] = React.useState("");
  const [agentDescription, setAgentDescription] = React.useState("");
  const [showMenu, setShowMenu] = React.useState<string | null>(null);

  const handleCreateAgent = async () => {
    if (!selectedTemplate || !agentName) return;

    await createAgent(agentName, selectedTemplate, agentDescription);
    setShowCreateDialog(false);
    setSelectedTemplate(null);
    setAgentName("");
    setAgentDescription("");
  };

  const handleStatusToggle = async (agentId: string, currentStatus: AgentStatus) => {
    const newStatus: AgentStatus = currentStatus === "active" ? "paused" : "active";
    await updateAgentStatus(agentId, newStatus);
    setShowMenu(null);
  };

  const handleDelete = async (agentId: string) => {
    await deleteAgent(agentId);
    setShowMenu(null);
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
                      <div className="flex items-center justify-between">
                        <span className="text-text-tertiary">Daily Budget</span>
                        <span className="text-text-primary">
                          {formatCurrency(agent.budget.spent.daily)} /{" "}
                          {formatCurrency(agent.budget.dailyLimit)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-primary rounded-full"
                          style={{
                            width: `${Math.min(
                              (agent.budget.spent.daily / agent.budget.dailyLimit) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-text-tertiary">
                        <span>Approval threshold</span>
                        <span>{formatCurrency(agent.permissions.requireApprovalAbove)}</span>
                      </div>
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
                  Create your first AI shopping agent to get started
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>
              Choose a template to get started or create a custom agent
            </DialogDescription>
          </DialogHeader>

          {!selectedTemplate ? (
            <div className="grid grid-cols-2 gap-3 py-4">
              {agentTemplates.map((template) => (
                <button
                  key={template.id}
                  className="p-4 text-left rounded-lg border border-border-default hover:border-accent-primary hover:bg-bg-hover transition-colors"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <span className="text-2xl mb-2 block">{template.icon}</span>
                  <p className="font-medium text-text-primary">{template.name}</p>
                  <p className="text-sm text-text-tertiary mt-1">{template.description}</p>
                </button>
              ))}
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
                <Badge variant="outline">
                  {agentTemplates.find((t) => t.id === selectedTemplate)?.name}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Agent Name</label>
                <Input
                  placeholder="e.g., My Deal Hunter"
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
                  rows={3}
                />
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

