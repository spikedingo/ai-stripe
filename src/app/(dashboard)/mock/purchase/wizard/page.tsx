"use client";

import * as React from "react";
import {
  Building2,
  Bot,
  Cloud,
  Settings2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  DollarSign,
  Users,
  Clock,
  Zap,
  Database,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mockAgentsForSaaS,
  mockSaaSTools,
  mockSaaSThinkingChain,
  type SaaSTool,
  type ThinkingStep,
} from "@/lib/mock-data";

type WizardStep = "agent" | "service" | "subscription" | "approval" | "confirm" | "executing";
type ServiceType = "saas" | "api" | "cloud";
type BillingCycle = "monthly" | "yearly";

interface FormData {
  agentId: string;
  serviceType: ServiceType | "";
  selectedTool: SaaSTool | null;
  seats: number;
  billingCycle: BillingCycle;
  autoApproveThreshold: string;
  monthlyBudgetLimit: string;
  paymentMethod: "company_card" | "agent_wallet";
  notes: string;
}

const steps: { id: WizardStep; title: string; icon: React.ElementType }[] = [
  { id: "agent", title: "Select Agent", icon: Bot },
  { id: "service", title: "Service Type", icon: Cloud },
  { id: "subscription", title: "Subscription", icon: Building2 },
  { id: "approval", title: "Approval Rules", icon: Settings2 },
  { id: "confirm", title: "Confirm", icon: CheckCircle2 },
];

const serviceTypes = [
  {
    id: "saas" as ServiceType,
    title: "SaaS Subscription",
    description: "Team collaboration tools, design software, productivity apps",
    icon: Building2,
    examples: "Figma, Notion, Slack, Linear",
  },
  {
    id: "api" as ServiceType,
    title: "API Usage",
    description: "Pay-per-call API services for AI, data, and more",
    icon: Zap,
    examples: "OpenAI, Anthropic, Twilio",
  },
  {
    id: "cloud" as ServiceType,
    title: "Cloud Services",
    description: "Infrastructure, hosting, and cloud computing",
    icon: Database,
    examples: "AWS, Vercel, Cloudflare",
  },
];

export default function WizardSaaSPage() {
  const [currentStep, setCurrentStep] = React.useState<WizardStep>("agent");
  const [formData, setFormData] = React.useState<FormData>({
    agentId: "",
    serviceType: "",
    selectedTool: null,
    seats: 5,
    billingCycle: "monthly",
    autoApproveThreshold: "100",
    monthlyBudgetLimit: "1000",
    paymentMethod: "agent_wallet",
    notes: "",
  });
  const [isValidating, setIsValidating] = React.useState(false);
  const [executionSteps, setExecutionSteps] = React.useState<ThinkingStep[]>([]);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const selectedAgent = mockAgentsForSaaS.find((a) => a.id === formData.agentId);

  // Calculate pricing
  const calculateMonthlyPrice = () => {
    if (!formData.selectedTool) return 0;
    const basePrice = formData.billingCycle === "yearly"
      ? formData.selectedTool.yearlyPrice / 12
      : formData.selectedTool.monthlyPrice;
    return basePrice * formData.seats;
  };

  const calculateYearlyPrice = () => {
    if (!formData.selectedTool) return 0;
    return formData.billingCycle === "yearly"
      ? formData.selectedTool.yearlyPrice * formData.seats
      : formData.selectedTool.monthlyPrice * 12 * formData.seats;
  };

  const yearlySavings = () => {
    if (!formData.selectedTool) return 0;
    const monthlyTotal = formData.selectedTool.monthlyPrice * 12 * formData.seats;
    const yearlyTotal = formData.selectedTool.yearlyPrice * formData.seats;
    return monthlyTotal - yearlyTotal;
  };

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep === "subscription") {
      setIsValidating(true);
      await new Promise((r) => setTimeout(r, 800));
      setIsValidating(false);
    }

    if (currentStep === "confirm") {
      setCurrentStep("executing");
      simulateExecution();
      return;
    }

    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const handleBack = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const simulateExecution = async () => {
    const steps = [...mockSaaSThinkingChain];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      steps[i] = { ...steps[i], status: i < 3 ? "completed" : steps[i].status };
      setExecutionSteps([...steps]);

      if (steps[i].status === "waiting_approval") break;
    }
  };

  const handleApprove = async () => {
    const steps = [...executionSteps];

    const approvalIndex = steps.findIndex((s) => s.status === "waiting_approval");
    if (approvalIndex >= 0) {
      steps[approvalIndex] = { ...steps[approvalIndex], status: "completed" };
      setExecutionSteps([...steps]);
    }

    for (let i = approvalIndex + 1; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      steps[i] = { ...steps[i], status: "completed" };
      setExecutionSteps([...steps]);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case "agent":
        return !!formData.agentId;
      case "service":
        return !!formData.serviceType;
      case "subscription":
        return !!formData.selectedTool && formData.seats > 0;
      case "approval":
        return !!formData.autoApproveThreshold && !!formData.monthlyBudgetLimit;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const filteredTools = mockSaaSTools.filter((t) => t.category === formData.serviceType);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <Building2 className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Team SaaS Subscription Manager
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Manage your team&apos;s software subscriptions with AI-powered procurement and approval workflows.
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep !== "executing" && (
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStepIndex > index;

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full transition-colors flex-shrink-0",
                      isActive && "bg-accent-primary text-text-inverse",
                      isCompleted && "bg-success/20 text-success",
                      !isActive && !isCompleted && "bg-bg-tertiary text-text-tertiary"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                    <span className="text-sm font-medium md:hidden">{index + 1}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-6 h-0.5 transition-colors flex-shrink-0",
                        isCompleted ? "bg-success" : "bg-border-subtle"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Form Card */}
        <Card>
          <CardContent className="p-6">
            {/* Step 1: Select Agent */}
            {currentStep === "agent" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Select Procurement Agent
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Choose which AI agent will handle this subscription purchase
                  </p>
                </div>

                <div className="grid gap-3">
                  {mockAgentsForSaaS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => updateForm({ agentId: agent.id })}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                        formData.agentId === agent.id
                          ? "border-accent-primary bg-accent-primary/5 ring-2 ring-accent-primary/20"
                          : "border-border-subtle hover:border-border-default hover:bg-bg-hover"
                      )}
                    >
                      <span className="text-3xl">{agent.avatar}</span>
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{agent.name}</p>
                        <p className="text-sm text-text-tertiary">{agent.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={agent.status === "active" ? "success" : "warning"}>
                          {agent.status}
                        </Badge>
                        <p className="text-xs text-text-tertiary mt-1">
                          Budget: ${agent.monthlyBudget}/mo
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Service Type */}
            {currentStep === "service" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Choose Service Type
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Select the type of service you want to subscribe to
                  </p>
                </div>

                <div className="grid gap-3">
                  {serviceTypes.map((service) => {
                    const Icon = service.icon;
                    return (
                      <button
                        key={service.id}
                        onClick={() => updateForm({ serviceType: service.id, selectedTool: null })}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg border text-left transition-all",
                          formData.serviceType === service.id
                            ? "border-accent-primary bg-accent-primary/5 ring-2 ring-accent-primary/20"
                            : "border-border-subtle hover:border-border-default hover:bg-bg-hover"
                        )}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-tertiary flex-shrink-0">
                          <Icon className="h-5 w-5 text-text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{service.title}</p>
                          <p className="text-sm text-text-tertiary mt-0.5">{service.description}</p>
                          <p className="text-xs text-accent-primary mt-2">{service.examples}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Subscription Details */}
            {currentStep === "subscription" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Configure Subscription
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Select the tool and configure seats and billing
                  </p>
                </div>

                {/* Tool Selection */}
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-2">
                    Select Tool
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {filteredTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => updateForm({ selectedTool: tool })}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                          formData.selectedTool?.id === tool.id
                            ? "border-accent-primary bg-accent-primary/5 ring-2 ring-accent-primary/20"
                            : "border-border-subtle hover:border-border-default hover:bg-bg-hover"
                        )}
                      >
                        <span className="text-2xl">{tool.logo}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">{tool.name}</p>
                          <p className="text-xs text-text-tertiary">
                            ${tool.monthlyPrice}/seat/mo
                          </p>
                        </div>
                        {formData.selectedTool?.id === tool.id && (
                          <CheckCircle2 className="h-5 w-5 text-accent-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seats and Billing */}
                {formData.selectedTool && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-text-secondary block mb-1.5">
                          <Users className="h-3.5 w-3.5 inline mr-1" />
                          Number of Seats
                        </label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="icon-sm"
                            onClick={() => updateForm({ seats: Math.max(1, formData.seats - 1) })}
                            disabled={formData.seats <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={formData.seats}
                            onChange={(e) => updateForm({ seats: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-20 text-center"
                            min={1}
                          />
                          <Button
                            variant="secondary"
                            size="icon-sm"
                            onClick={() => updateForm({ seats: formData.seats + 1 })}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-text-secondary block mb-1.5">
                          <Clock className="h-3.5 w-3.5 inline mr-1" />
                          Billing Cycle
                        </label>
                        <div className="flex gap-2">
                          <Button
                            variant={formData.billingCycle === "monthly" ? "default" : "secondary"}
                            size="sm"
                            onClick={() => updateForm({ billingCycle: "monthly" })}
                            className="flex-1"
                          >
                            Monthly
                          </Button>
                          <Button
                            variant={formData.billingCycle === "yearly" ? "default" : "secondary"}
                            size="sm"
                            onClick={() => updateForm({ billingCycle: "yearly" })}
                            className="flex-1"
                          >
                            Yearly
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="p-4 rounded-lg bg-bg-tertiary">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary">Monthly Cost</span>
                        <span className="font-semibold text-text-primary">
                          ${calculateMonthlyPrice().toFixed(2)}/mo
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">Yearly Total</span>
                        <span className="font-semibold text-text-primary">
                          ${calculateYearlyPrice().toFixed(2)}/yr
                        </span>
                      </div>
                      {formData.billingCycle === "yearly" && yearlySavings() > 0 && (
                        <Badge variant="success" className="mt-2">
                          Save ${yearlySavings().toFixed(2)}/year with annual billing
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Approval Rules */}
            {currentStep === "approval" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Set Approval Rules
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Configure budget limits and approval thresholds
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">
                      Auto-approve Threshold
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                      <Input
                        type="number"
                        value={formData.autoApproveThreshold}
                        onChange={(e) => updateForm({ autoApproveThreshold: e.target.value })}
                        placeholder="100"
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      Auto-approve purchases under this amount
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">
                      Monthly Budget Limit
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                      <Input
                        type="number"
                        value={formData.monthlyBudgetLimit}
                        onChange={(e) => updateForm({ monthlyBudgetLimit: e.target.value })}
                        placeholder="1000"
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      Maximum monthly spend for this agent
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-2">
                    Payment Method
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => updateForm({ paymentMethod: "agent_wallet" })}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        formData.paymentMethod === "agent_wallet"
                          ? "border-accent-primary bg-accent-primary/5 ring-2 ring-accent-primary/20"
                          : "border-border-subtle hover:border-border-default"
                      )}
                    >
                      <p className="font-medium text-text-primary">Agent Wallet (USDC)</p>
                      <p className="text-xs text-text-tertiary">Pay with on-chain stablecoin</p>
                    </button>
                    <button
                      onClick={() => updateForm({ paymentMethod: "company_card" })}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        formData.paymentMethod === "company_card"
                          ? "border-accent-primary bg-accent-primary/5 ring-2 ring-accent-primary/20"
                          : "border-border-subtle hover:border-border-default"
                      )}
                    >
                      <p className="font-medium text-text-primary">Company Card</p>
                      <p className="text-xs text-text-tertiary">Use saved payment method</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirm */}
            {currentStep === "confirm" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Review & Confirm
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Review your subscription order before submitting
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-bg-tertiary">
                    <div className="flex items-center gap-3 mb-3">
                      <Bot className="h-5 w-5 text-accent-primary" />
                      <span className="font-medium text-text-primary">Agent</span>
                    </div>
                    {selectedAgent && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedAgent.avatar}</span>
                        <div>
                          <p className="font-medium text-text-primary">{selectedAgent.name}</p>
                          <p className="text-xs text-text-tertiary">{selectedAgent.description}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-bg-tertiary">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="h-5 w-5 text-accent-primary" />
                      <span className="font-medium text-text-primary">Subscription Details</span>
                    </div>
                    {formData.selectedTool && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{formData.selectedTool.logo}</span>
                          <div>
                            <p className="font-medium text-text-primary">{formData.selectedTool.name}</p>
                            <p className="text-xs text-text-tertiary">{formData.seats} seats • {formData.billingCycle} billing</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border-subtle">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Monthly Cost</span>
                            <span className="font-medium text-text-primary">
                              ${calculateMonthlyPrice().toFixed(2)}/mo
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-bg-tertiary">
                    <div className="flex items-center gap-3 mb-3">
                      <Settings2 className="h-5 w-5 text-accent-primary" />
                      <span className="font-medium text-text-primary">Approval Settings</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-text-tertiary">Auto-approve</p>
                        <p className="font-medium text-text-primary">&lt; ${formData.autoApproveThreshold}</p>
                      </div>
                      <div>
                        <p className="text-text-tertiary">Monthly Limit</p>
                        <p className="font-medium text-text-primary">${formData.monthlyBudgetLimit}</p>
                      </div>
                    </div>
                    <Badge variant="info" className="mt-3">
                      {formData.paymentMethod === "agent_wallet" ? "Paying with USDC" : "Company Card"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Executing State */}
            {currentStep === "executing" && (
              <div className="space-y-4">
                {executionSteps.length > 0 && executionSteps.every((s) => s.status === "completed") ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <h3 className="text-lg font-semibold text-text-primary">
                      Subscription Complete
                    </h3>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />
                    <h3 className="text-lg font-semibold text-text-primary">
                      Processing Subscription
                    </h3>
                  </div>
                )}

                <div className="space-y-2">
                  {executionSteps.map((step) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all",
                        step.status === "completed" && "bg-success/5",
                        step.status === "waiting_approval" && "bg-warning/10",
                        step.status === "in_progress" && "bg-accent-primary/5"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {step.status === "completed" && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                        {step.status === "waiting_approval" && (
                          <AlertCircle className="h-5 w-5 text-warning" />
                        )}
                        {step.status === "in_progress" && (
                          <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />
                        )}
                        {step.status === "pending" && (
                          <Clock className="h-5 w-5 text-text-tertiary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-medium",
                            step.status === "completed" || step.status === "in_progress"
                              ? "text-text-primary"
                              : "text-text-tertiary"
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-text-tertiary">{step.description}</p>
                      </div>
                      {step.status === "waiting_approval" && (
                        <Badge variant="warning">Needs Approval</Badge>
                      )}
                      {step.duration && step.status === "completed" && (
                        <span className="text-xs text-text-tertiary">
                          {(step.duration / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {executionSteps.some((s) => s.status === "waiting_approval") && (
                  <div className="flex gap-3 pt-4 border-t border-border-subtle">
                    <Button variant="secondary" className="flex-1">
                      Reject
                    </Button>
                    <Button className="flex-1" onClick={handleApprove}>
                      Approve Subscription
                    </Button>
                  </div>
                )}

                {executionSteps.length > 0 && executionSteps.every((s) => s.status === "completed") && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle">
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm text-success font-medium">
                        🎉 Subscription activated successfully! Your team can now access {formData.selectedTool?.name}.
                      </p>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setCurrentStep("agent");
                        setExecutionSteps([]);
                        setFormData({
                          agentId: "",
                          serviceType: "",
                          selectedTool: null,
                          seats: 5,
                          billingCycle: "monthly",
                          autoApproveThreshold: "100",
                          monthlyBudgetLimit: "1000",
                          paymentMethod: "agent_wallet",
                          notes: "",
                        });
                      }}
                    >
                      Start New Subscription
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== "executing" && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || isValidating}
                  className="flex-1 gap-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : currentStep === "confirm" ? (
                    <>
                      Start Subscription
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
