"use client";

import * as React from "react";
import {
  CreditCard,
  Plus,
  X,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Play,
  Pause,
  Settings,
  DollarSign,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { mockAgentsForPurchase, mockThinkingChain, type ThinkingStep } from "@/lib/mock-data";

interface PurchaseTask {
  id: string;
  productName: string;
  productUrl: string;
  targetPrice: number;
  currentPrice?: number;
  status: "monitoring" | "ready" | "purchasing" | "completed" | "failed";
}

export default function CardPurchasePage() {
  const [expandedAgent, setExpandedAgent] = React.useState<string | null>(null);
  const [tasks, setTasks] = React.useState<Record<string, PurchaseTask[]>>({
    agent_1: [
      {
        id: "task_1",
        productName: "Sony WH-1000XM5",
        productUrl: "https://amazon.com/dp/B09XS7JWHH",
        targetPrice: 320,
        currentPrice: 348,
        status: "monitoring",
      },
    ],
    agent_2: [],
    agent_3: [],
  });
  const [newTaskData, setNewTaskData] = React.useState({
    url: "",
    targetPrice: "",
  });
  const [isAdding, setIsAdding] = React.useState(false);
  const [executingTask, setExecutingTask] = React.useState<string | null>(null);
  const [executionSteps, setExecutionSteps] = React.useState<ThinkingStep[]>([]);

  const handleToggleExpand = (agentId: string) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
  };

  const handleAddTask = async (agentId: string) => {
    if (!newTaskData.url || !newTaskData.targetPrice) return;

    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 800));

    const newTask: PurchaseTask = {
      id: `task_${Date.now()}`,
      productName: "Apple AirPods Pro (2nd Gen)",
      productUrl: newTaskData.url,
      targetPrice: parseFloat(newTaskData.targetPrice),
      currentPrice: 249,
      status: "monitoring",
    };

    setTasks((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), newTask],
    }));

    setNewTaskData({ url: "", targetPrice: "" });
    setIsAdding(false);
  };

  const handleExecuteTask = async (agentId: string, taskId: string) => {
    setExecutingTask(taskId);
    
    // Update task status
    setTasks((prev) => ({
      ...prev,
      [agentId]: prev[agentId].map((t) =>
        t.id === taskId ? { ...t, status: "purchasing" as const } : t
      ),
    }));

    // Simulate execution
    const steps = [...mockThinkingChain];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      steps[i] = { ...steps[i], status: i < 3 ? "completed" : steps[i].status };
      setExecutionSteps([...steps]);
      
      if (steps[i].status === "waiting_approval") break;
    }
  };

  const handleApprove = async (agentId: string, taskId: string) => {
    const steps = [...executionSteps];
    
    // Find and complete the approval step
    const approvalIndex = steps.findIndex((s) => s.status === "waiting_approval");
    if (approvalIndex >= 0) {
      steps[approvalIndex] = { ...steps[approvalIndex], status: "completed" };
      setExecutionSteps([...steps]);
    }
    
    // Continue with remaining steps
    for (let i = approvalIndex + 1; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      steps[i] = { ...steps[i], status: "completed" };
      setExecutionSteps([...steps]);
    }
    
    // Mark task as completed
    setTasks((prev) => ({
      ...prev,
      [agentId]: prev[agentId].map((t) =>
        t.id === taskId ? { ...t, status: "completed" as const } : t
      ),
    }));
    setExecutingTask(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <CreditCard className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Card Action Style
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Inline purchase controls directly on Agent cards. Click on an agent to expand
            and manage purchase tasks.
          </p>
        </div>

        {/* Agent Cards */}
        <div className="space-y-4">
          {mockAgentsForPurchase.map((agent) => {
            const isExpanded = expandedAgent === agent.id;
            const agentTasks = tasks[agent.id] || [];

            return (
              <Card
                key={agent.id}
                className={cn(
                  "transition-all overflow-hidden",
                  isExpanded && "ring-2 ring-accent-primary/20"
                )}
              >
                {/* Agent Header - Always visible */}
                <button
                  onClick={() => handleToggleExpand(agent.id)}
                  className="w-full text-left"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-bg-tertiary flex items-center justify-center text-2xl">
                          {agent.avatar}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {agent.name}
                            <Badge variant={agent.status === "active" ? "success" : "warning"}>
                              {agent.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {agent.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-text-secondary">Daily Budget</p>
                          <p className="font-medium text-text-primary">
                            ${agent.spent} / ${agent.dailyBudget}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {agentTasks.length > 0 && (
                            <Badge variant="info">{agentTasks.length} tasks</Badge>
                          )}
                          <ChevronRight
                            className={cn(
                              "h-5 w-5 text-text-tertiary transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <CardContent className="border-t border-border-subtle pt-4 space-y-4">
                    {/* Existing Tasks */}
                    {agentTasks.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-text-secondary">
                          Active Purchase Tasks
                        </h4>
                        {agentTasks.map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "p-4 rounded-lg border transition-all",
                              task.status === "monitoring" && "border-border-subtle bg-bg-secondary",
                              task.status === "purchasing" && "border-accent-primary/50 bg-accent-primary/5",
                              task.status === "completed" && "border-success/50 bg-success/5"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-text-primary">
                                    {task.productName}
                                  </p>
                                  <Badge
                                    variant={
                                      task.status === "monitoring"
                                        ? "default"
                                        : task.status === "purchasing"
                                        ? "info"
                                        : "success"
                                    }
                                  >
                                    {task.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                                  <ExternalLink className="h-3 w-3" />
                                  {task.productUrl}
                                </p>

                                <div className="flex items-center gap-4 mt-3">
                                  <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4 text-success" />
                                    <span className="text-sm text-success font-medium">
                                      ${task.targetPrice}
                                    </span>
                                  </div>
                                  {task.currentPrice && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-4 w-4 text-text-tertiary" />
                                      <span className="text-sm text-text-secondary">
                                        Current: ${task.currentPrice}
                                      </span>
                                    </div>
                                  )}
                                  {task.currentPrice && task.currentPrice > task.targetPrice && (
                                    <Badge variant="warning" className="text-xs">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      {Math.round(
                                        ((task.currentPrice - task.targetPrice) / task.targetPrice) *
                                          100
                                      )}
                                      % above target
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {task.status === "monitoring" && (
                                  <>
                                    <Button
                                      variant="secondary"
                                      size="icon-sm"
                                      title="Pause monitoring"
                                    >
                                      <Pause className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleExecuteTask(agent.id, task.id)}
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      Buy Now
                                    </Button>
                                  </>
                                )}
                                {task.status === "purchasing" && (
                                  <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />
                                )}
                              </div>
                            </div>

                            {/* Execution Steps */}
                            {executingTask === task.id && executionSteps.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-border-subtle">
                                <div className="space-y-2">
                                  {executionSteps.map((step) => (
                                    <div
                                      key={step.id}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      {step.status === "completed" && (
                                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                                      )}
                                      {step.status === "waiting_approval" && (
                                        <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
                                      )}
                                      {step.status === "pending" && (
                                        <div className="h-4 w-4 rounded-full border border-border-default flex-shrink-0" />
                                      )}
                                      <span
                                        className={cn(
                                          step.status === "completed"
                                            ? "text-text-primary"
                                            : "text-text-tertiary"
                                        )}
                                      >
                                        {step.title}
                                      </span>
                                      {step.status === "waiting_approval" && (
                                        <div className="ml-auto flex gap-2">
                                          <Button variant="secondary" size="sm">
                                            Reject
                                          </Button>
                                          <Button size="sm" onClick={() => handleApprove(agent.id, task.id)}>Approve</Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Task Form */}
                    <div className="p-4 rounded-lg border border-dashed border-border-default bg-bg-secondary">
                      <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Purchase Task
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          value={newTaskData.url}
                          onChange={(e) =>
                            setNewTaskData((prev) => ({ ...prev, url: e.target.value }))
                          }
                          placeholder="Product URL (e.g., amazon.com/dp/...)"
                          className="flex-1"
                        />
                        <div className="relative w-full sm:w-32">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                          <Input
                            type="number"
                            value={newTaskData.targetPrice}
                            onChange={(e) =>
                              setNewTaskData((prev) => ({ ...prev, targetPrice: e.target.value }))
                            }
                            placeholder="Target"
                            className="pl-8"
                          />
                        </div>
                        <Button
                          onClick={() => handleAddTask(agent.id)}
                          disabled={!newTaskData.url || !newTaskData.targetPrice || isAdding}
                          className="gap-2"
                        >
                          {isAdding ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Add Task
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Agent Settings Link */}
                    <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                      <p className="text-xs text-text-tertiary">
                        {agentTasks.length} active task{agentTasks.length !== 1 ? "s" : ""}
                      </p>
                      <Button variant="ghost" size="sm" className="gap-2 text-text-secondary">
                        <Settings className="h-4 w-4" />
                        Agent Settings
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Info Footer */}
        <Card className="bg-bg-secondary">
          <CardContent className="py-4">
            <p className="text-sm text-text-secondary text-center">
              Click on any agent card to expand and manage purchase tasks.
              Each agent can monitor multiple products simultaneously.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

