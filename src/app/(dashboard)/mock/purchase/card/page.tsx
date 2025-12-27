"use client";

import * as React from "react";
import {
  CalendarClock,
  Plus,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Settings,
  DollarSign,
  Package,
  RefreshCcw,
  Trash2,
  Clock,
  ShoppingCart,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mockAgentsForRecurring,
  mockRecurringPlans,
  mockRecurringThinkingChain,
  type RecurringPlan,
  type ThinkingStep,
} from "@/lib/mock-data";

type CycleOption = "weekly" | "biweekly" | "monthly" | "custom";

const cycleOptions: { id: CycleOption; label: string; days: number }[] = [
  { id: "weekly", label: "Every Week", days: 7 },
  { id: "biweekly", label: "Every 2 Weeks", days: 14 },
  { id: "monthly", label: "Every Month", days: 30 },
  { id: "custom", label: "Custom", days: 0 },
];

const platformOptions = [
  { id: "amazon", name: "Amazon", icon: "📦" },
  { id: "walmart", name: "Walmart", icon: "🏪" },
  { id: "target", name: "Target", icon: "🎯" },
  { id: "costco", name: "Costco", icon: "🛒" },
];

export default function CardRecurringPage() {
  const [expandedAgent, setExpandedAgent] = React.useState<string | null>(null);
  const [plans, setPlans] = React.useState<Record<string, RecurringPlan[]>>(mockRecurringPlans);
  const [newPlanData, setNewPlanData] = React.useState({
    productName: "",
    platform: "amazon",
    cycle: "monthly" as CycleOption,
    customDays: "30",
    quantity: "1",
    budget: "",
  });
  const [isAdding, setIsAdding] = React.useState(false);
  const [executingPlan, setExecutingPlan] = React.useState<string | null>(null);
  const [executionSteps, setExecutionSteps] = React.useState<ThinkingStep[]>([]);
  const [showHistory, setShowHistory] = React.useState<string | null>(null);

  const handleToggleExpand = (agentId: string) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
    setShowHistory(null);
  };

  const formatNextOrder = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getCycleLabel = (cycle: string) => {
    switch (cycle) {
      case "weekly":
        return "Weekly";
      case "biweekly":
        return "Every 2 weeks";
      case "monthly":
        return "Monthly";
      default:
        return cycle;
    }
  };

  const handleAddPlan = async (agentId: string) => {
    if (!newPlanData.productName || !newPlanData.budget) return;

    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 800));

    const nextOrder = new Date();
    nextOrder.setDate(
      nextOrder.getDate() +
        (newPlanData.cycle === "custom"
          ? parseInt(newPlanData.customDays)
          : cycleOptions.find((c) => c.id === newPlanData.cycle)?.days || 30)
    );

    const newPlan: RecurringPlan = {
      id: `plan_${Date.now()}`,
      productName: newPlanData.productName,
      platform: newPlanData.platform,
      platformIcon: platformOptions.find((p) => p.id === newPlanData.platform)?.icon || "📦",
      cycle: newPlanData.cycle,
      customDays: newPlanData.cycle === "custom" ? parseInt(newPlanData.customDays) : undefined,
      quantity: parseInt(newPlanData.quantity) || 1,
      budgetPerOrder: parseFloat(newPlanData.budget),
      lastOrder: null,
      nextOrder: nextOrder.toISOString().split("T")[0],
      status: "active",
      orderHistory: [],
    };

    setPlans((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), newPlan],
    }));

    setNewPlanData({
      productName: "",
      platform: "amazon",
      cycle: "monthly",
      customDays: "30",
      quantity: "1",
      budget: "",
    });
    setIsAdding(false);
  };

  const handleTogglePlan = (agentId: string, planId: string) => {
    setPlans((prev) => ({
      ...prev,
      [agentId]: prev[agentId].map((p) =>
        p.id === planId
          ? { ...p, status: p.status === "active" ? "paused" : "active" }
          : p
      ),
    }));
  };

  const handleDeletePlan = (agentId: string, planId: string) => {
    setPlans((prev) => ({
      ...prev,
      [agentId]: prev[agentId].filter((p) => p.id !== planId),
    }));
  };

  const handleOrderNow = async (agentId: string, planId: string) => {
    setExecutingPlan(planId);

    const steps = [...mockRecurringThinkingChain];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      steps[i] = { ...steps[i], status: i < 3 ? "completed" : steps[i].status };
      setExecutionSteps([...steps]);

      if (steps[i].status === "waiting_approval") break;
    }
  };

  const handleApprove = async (agentId: string, planId: string) => {
    const steps = [...executionSteps];

    const approvalIndex = steps.findIndex((s) => s.status === "waiting_approval");
    if (approvalIndex >= 0) {
      steps[approvalIndex] = { ...steps[approvalIndex], status: "completed" };
      setExecutionSteps([...steps]);
    }

    for (let i = approvalIndex + 1; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      steps[i] = { ...steps[i], status: "completed" };
      setExecutionSteps([...steps]);
    }

    // Update plan with new order
    const today = new Date().toISOString().split("T")[0];
    setPlans((prev) => ({
      ...prev,
      [agentId]: prev[agentId].map((p) => {
        if (p.id === planId) {
          const nextDate = new Date();
          const days =
            p.cycle === "custom"
              ? p.customDays || 30
              : cycleOptions.find((c) => c.id === p.cycle)?.days || 30;
          nextDate.setDate(nextDate.getDate() + days);

          return {
            ...p,
            lastOrder: today,
            nextOrder: nextDate.toISOString().split("T")[0],
            orderHistory: [
              { date: today, amount: p.budgetPerOrder, status: "completed" as const },
              ...p.orderHistory,
            ],
          };
        }
        return p;
      }),
    }));

    setExecutingPlan(null);
    setExecutionSteps([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <CalendarClock className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Recurring Purchase Plans
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Set up automatic recurring orders for household essentials. Never run out of
            everyday items again.
          </p>
        </div>

        {/* Agent Cards */}
        <div className="space-y-4">
          {mockAgentsForRecurring.map((agent) => {
            const isExpanded = expandedAgent === agent.id;
            const agentPlans = plans[agent.id] || [];
            const activePlans = agentPlans.filter((p) => p.status === "active");

            return (
              <Card
                key={agent.id}
                className={cn(
                  "transition-all overflow-hidden",
                  isExpanded && "ring-2 ring-accent-primary/20"
                )}
              >
                {/* Agent Header */}
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
                          <p className="text-sm text-text-secondary">Monthly Budget</p>
                          <p className="font-medium text-text-primary">
                            ${agent.spent.toFixed(2)} / ${agent.monthlyBudget}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {activePlans.length > 0 && (
                            <Badge variant="info">
                              {activePlans.length} active
                            </Badge>
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
                    {/* Existing Plans */}
                    {agentPlans.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                          <RefreshCcw className="h-4 w-4" />
                          Active Recurring Plans
                        </h4>
                        {agentPlans.map((plan) => (
                          <div
                            key={plan.id}
                            className={cn(
                              "p-4 rounded-lg border transition-all",
                              plan.status === "active" && "border-border-subtle bg-bg-secondary",
                              plan.status === "paused" && "border-warning/50 bg-warning/5",
                              executingPlan === plan.id && "border-accent-primary/50 bg-accent-primary/5"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xl">{plan.platformIcon}</span>
                                  <p className="font-medium text-text-primary">
                                    {plan.productName}
                                  </p>
                                  <Badge
                                    variant={plan.status === "active" ? "success" : "warning"}
                                  >
                                    {plan.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-text-tertiary mt-1">
                                  {platformOptions.find((p) => p.id === plan.platform)?.name} • Qty: {plan.quantity}
                                </p>

                                <div className="flex items-center gap-4 mt-3 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <CalendarClock className="h-4 w-4 text-accent-primary" />
                                    <span className="text-sm text-text-secondary">
                                      {getCycleLabel(plan.cycle)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4 text-success" />
                                    <span className="text-sm font-medium text-success">
                                      ${plan.budgetPerOrder}/order
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-text-tertiary" />
                                    <span className="text-sm text-text-secondary">
                                      Next: <span className="font-medium text-text-primary">{formatNextOrder(plan.nextOrder)}</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Order History Toggle */}
                                {plan.orderHistory.length > 0 && (
                                  <button
                                    onClick={() => setShowHistory(showHistory === plan.id ? null : plan.id)}
                                    className="text-xs text-accent-primary hover:underline mt-2 flex items-center gap-1"
                                  >
                                    <History className="h-3 w-3" />
                                    {showHistory === plan.id ? "Hide" : "Show"} order history ({plan.orderHistory.length})
                                  </button>
                                )}

                                {/* Order History */}
                                {showHistory === plan.id && plan.orderHistory.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-border-subtle">
                                    <p className="text-xs font-medium text-text-secondary mb-2">Recent Orders</p>
                                    <div className="space-y-1">
                                      {plan.orderHistory.slice(0, 3).map((order, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                          <span className="text-text-tertiary">{order.date}</span>
                                          <span className="text-text-secondary">${order.amount.toFixed(2)}</span>
                                          <Badge variant="success" className="text-xs py-0">
                                            {order.status}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {plan.status === "active" && executingPlan !== plan.id && (
                                  <>
                                    <Button
                                      variant="secondary"
                                      size="icon-sm"
                                      title="Pause plan"
                                      onClick={() => handleTogglePlan(agent.id, plan.id)}
                                    >
                                      <Pause className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleOrderNow(agent.id, plan.id)}
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-1" />
                                      Order Now
                                    </Button>
                                  </>
                                )}
                                {plan.status === "paused" && (
                                  <>
                                    <Button
                                      variant="secondary"
                                      size="icon-sm"
                                      title="Delete plan"
                                      onClick={() => handleDeletePlan(agent.id, plan.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleTogglePlan(agent.id, plan.id)}
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      Resume
                                    </Button>
                                  </>
                                )}
                                {executingPlan === plan.id && (
                                  <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />
                                )}
                              </div>
                            </div>

                            {/* Execution Steps */}
                            {executingPlan === plan.id && executionSteps.length > 0 && (
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
                                            Skip
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() => handleApprove(agent.id, plan.id)}
                                          >
                                            Approve
                                          </Button>
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

                    {/* Add New Plan Form */}
                    <div className="p-4 rounded-lg border border-dashed border-border-default bg-bg-secondary">
                      <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Recurring Plan
                      </h4>

                      <div className="space-y-4">
                        {/* Product Name */}
                        <div>
                          <label className="text-xs text-text-secondary block mb-1">
                            Product Name
                          </label>
                          <Input
                            value={newPlanData.productName}
                            onChange={(e) =>
                              setNewPlanData((prev) => ({ ...prev, productName: e.target.value }))
                            }
                            placeholder="e.g., Kleenex Facial Tissue (4-pack)"
                          />
                        </div>

                        {/* Platform Selection */}
                        <div>
                          <label className="text-xs text-text-secondary block mb-1">
                            Preferred Platform
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            {platformOptions.map((platform) => (
                              <button
                                key={platform.id}
                                onClick={() =>
                                  setNewPlanData((prev) => ({ ...prev, platform: platform.id }))
                                }
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                                  newPlanData.platform === platform.id
                                    ? "border-accent-primary bg-accent-primary/5"
                                    : "border-border-subtle hover:border-border-default"
                                )}
                              >
                                <span>{platform.icon}</span>
                                <span className="text-sm">{platform.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cycle and Quantity */}
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              Repeat Every
                            </label>
                            <select
                              value={newPlanData.cycle}
                              onChange={(e) =>
                                setNewPlanData((prev) => ({
                                  ...prev,
                                  cycle: e.target.value as CycleOption,
                                }))
                              }
                              className="w-full h-10 px-3 rounded-lg border border-border-default bg-bg-primary text-text-primary"
                            >
                              {cycleOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {newPlanData.cycle === "custom" && (
                            <div>
                              <label className="text-xs text-text-secondary block mb-1">
                                Days
                              </label>
                              <Input
                                type="number"
                                value={newPlanData.customDays}
                                onChange={(e) =>
                                  setNewPlanData((prev) => ({ ...prev, customDays: e.target.value }))
                                }
                                min={1}
                              />
                            </div>
                          )}

                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              Quantity
                            </label>
                            <Input
                              type="number"
                              value={newPlanData.quantity}
                              onChange={(e) =>
                                setNewPlanData((prev) => ({ ...prev, quantity: e.target.value }))
                              }
                              min={1}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              Budget per Order
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                              <Input
                                type="number"
                                value={newPlanData.budget}
                                onChange={(e) =>
                                  setNewPlanData((prev) => ({ ...prev, budget: e.target.value }))
                                }
                                placeholder="15.00"
                                className="pl-8"
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleAddPlan(agent.id)}
                          disabled={!newPlanData.productName || !newPlanData.budget || isAdding}
                          className="w-full gap-2"
                        >
                          {isAdding ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating Plan...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Create Recurring Plan
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Agent Settings Link */}
                    <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                      <p className="text-xs text-text-tertiary">
                        {activePlans.length} active plan{activePlans.length !== 1 ? "s" : ""}
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
            <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
              <Package className="h-4 w-4" />
              <p>
                Click on any agent card to manage recurring purchase plans for household essentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
