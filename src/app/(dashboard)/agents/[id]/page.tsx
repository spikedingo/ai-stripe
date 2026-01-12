"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowLeft, Save, Trash2, Plus, Play, Pause, Clock, Edit2 } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAgentStore } from "@/stores";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { Agent, AgentPermissions, AgentBudget, AgentTask } from "@/types";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { 
    agents, 
    tasks: allTasks,
    updateAgent, 
    deleteAgent, 
    isLoading,
    fetchAgentTasks,
    createAgentTask,
    updateAgentTask,
    deleteAgentTask,
  } = useAgentStore();

  const agent = agents.find((a) => a.id === params.id);
  const agentTasks = allTasks[params.id as string] || [];

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
  const [triggerMode, setTriggerMode] = React.useState<"manual" | "schedule">("schedule");
  
  // Task dialog state
  const [showTaskDialog, setShowTaskDialog] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<AgentTask | null>(null);
  const [taskName, setTaskName] = React.useState("");
  const [taskPrompt, setTaskPrompt] = React.useState("");
  const [taskCron, setTaskCron] = React.useState("*/3 * * * *");

  React.useEffect(() => {
    if (agent && authenticated && ready) {
      const loadTasks = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            await fetchAgentTasks(agent.id, token);
          }
        } catch (error) {
          console.error("[AgentDetail] Failed to load tasks:", error);
        }
      };
      
      setFormData({
        name: agent.name,
        description: agent.description,
        permissions: agent.permissions,
        budget: agent.budget,
        allowedMerchants: agent.allowedMerchants,
      });
      
      loadTasks();
    }
  }, [agent, authenticated, ready, getAccessToken, fetchAgentTasks]);

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

  const handleCreateTask = async () => {
    if (!taskName || !taskPrompt) return;

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }
      
      await createAgentTask(agent.id, {
        name: taskName,
        prompt: taskPrompt,
        cron: taskCron || null,
        enabled: true,
        has_memory: true,
      }, token);
      
      setShowTaskDialog(false);
      setTaskName("");
      setTaskPrompt("");
      setTaskCron("*/3 * * * *");
      
      // Refresh tasks
      await fetchAgentTasks(agent.id, token);
    } catch (error) {
      console.error("[AgentDetail] Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !taskName || !taskPrompt) return;

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }
      
      await updateAgentTask(agent.id, editingTask.id, {
        name: taskName,
        prompt: taskPrompt,
        cron: taskCron || null,
      }, token);
      
      setShowTaskDialog(false);
      setEditingTask(null);
      setTaskName("");
      setTaskPrompt("");
      setTaskCron("*/3 * * * *");
      
      // Refresh tasks
      await fetchAgentTasks(agent.id, token);
    } catch (error) {
      console.error("[AgentDetail] Failed to update task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleToggleTaskStatus = async (task: AgentTask) => {
    const newEnabled = !task.enabled;
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }
      
      await updateAgentTask(agent.id, task.id, { enabled: newEnabled }, token);
      await fetchAgentTasks(agent.id, token);
    } catch (error) {
      console.error("[AgentDetail] Failed to toggle task status:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error("Failed to get access token");
        }
        
        await deleteAgentTask(agent.id, taskId, token);
        await fetchAgentTasks(agent.id, token);
      } catch (error) {
        console.error("[AgentDetail] Failed to delete task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const openEditTaskDialog = (task: AgentTask) => {
    setEditingTask(task);
    setTaskName(task.name);
    setTaskPrompt(task.prompt);
    setTaskCron(task.cron || "*/3 * * * *");
    setShowTaskDialog(true);
  };

  const openCreateTaskDialog = () => {
    setEditingTask(null);
    setTaskName("");
    setTaskPrompt("");
    setTaskCron("*/3 * * * *");
    setShowTaskDialog(true);
  };

  const parseCronToReadable = (cron: string | null): string => {
    if (!cron) return "Manual";
    // Simple cron parser for common patterns
    if (cron === "*/3 * * * *") return "Every 3 minutes";
    if (cron === "*/5 * * * *") return "Every 5 minutes";
    if (cron === "*/10 * * * *") return "Every 10 minutes";
    if (cron === "*/15 * * * *") return "Every 15 minutes";
    if (cron === "*/30 * * * *") return "Every 30 minutes";
    if (cron === "0 * * * *") return "Every hour";
    if (cron === "0 */2 * * *") return "Every 2 hours";
    if (cron === "0 0 * * *") return "Daily at midnight";
    return cron;
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

          <Tabs defaultValue="tasks">
            <TabsList className="mb-6">
              <TabsTrigger value="tasks">Tasks & Triggers</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="merchants">Merchants</TabsTrigger>
            </TabsList>

            {/* Tasks & Triggers Tab */}
            <TabsContent value="tasks">
              <div className="space-y-4">
                {/* Trigger Mode Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trigger Mode</CardTitle>
                    <CardDescription>
                      Choose how this agent should be triggered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <button
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          triggerMode === "manual"
                            ? "border-accent-primary bg-accent-primary/5"
                            : "border-border-default hover:border-border-hover"
                        }`}
                        onClick={() => setTriggerMode("manual")}
                      >
                        <Play className="h-6 w-6 mb-2 text-accent-primary" />
                        <p className="font-medium text-text-primary">Manual</p>
                        <p className="text-sm text-text-tertiary mt-1">
                          Run tasks on demand
                        </p>
                      </button>
                      <button
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          triggerMode === "schedule"
                            ? "border-accent-primary bg-accent-primary/5"
                            : "border-border-default hover:border-border-hover"
                        }`}
                        onClick={() => setTriggerMode("schedule")}
                      >
                        <Clock className="h-6 w-6 mb-2 text-info" />
                        <p className="font-medium text-text-primary">Schedule</p>
                        <p className="text-sm text-text-tertiary mt-1">
                          Run on a schedule
                        </p>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks List Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Tasks</CardTitle>
                        <CardDescription>
                          Manage autonomous tasks for this agent
                        </CardDescription>
                      </div>
                      <Button onClick={openCreateTaskDialog} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {agentTasks.length > 0 ? (
                      <div className="space-y-3">
                        {agentTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-4 rounded-lg border border-border-default hover:border-border-hover transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-text-primary">{task.name}</h4>
                                  <Badge
                                    variant={task.enabled ? "success" : "warning"}
                                  >
                                    {task.enabled ? "enabled" : "disabled"}
                                  </Badge>
                                  {task.has_memory && (
                                    <Badge variant="info" className="text-xs">
                                      Memory
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                                  {task.prompt}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-text-tertiary mb-2">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                                  {task.cron && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {parseCronToReadable(task.cron)}
                                    </div>
                                  )}
                                  {task.minutes && (
                                    <span>Every {task.minutes} minutes</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 ml-4">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleToggleTaskStatus(task)}
                                  title={task.enabled ? "Disable" : "Enable"}
                                >
                                  {task.enabled ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => openEditTaskDialog(task)}
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-error" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-text-tertiary">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No tasks yet</p>
                        <p className="text-sm mt-1">Create a task to automate this agent</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chat Integration Hint */}
                <Card className="bg-info/5 border-info/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-text-secondary">
                      💡 <strong>Tip:</strong> You can also modify task schedules by chatting with
                      your agent. Just say something like &quot;Check for deals every 5
                      minutes&quot; or &quot;Run this task hourly&quot;.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Update the task details"
                : "Add a new autonomous task for this agent"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Task Name</label>
              <Input
                placeholder="e.g., Check for deals"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Prompt</label>
              <Textarea
                placeholder="What should the agent do in this task?"
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Schedule (Cron Expression)
              </label>
              <Input
                placeholder="*/3 * * * *"
                value={taskCron}
                onChange={(e) => setTaskCron(e.target.value)}
              />
              <p className="text-xs text-text-tertiary">
                Common examples: */3 * * * * (every 3 min), */5 * * * * (every 5 min), 0 * * *
                * (hourly)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingTask ? handleUpdateTask : handleCreateTask}
              disabled={!taskName || !taskPrompt || isLoading}
            >
              {isLoading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
