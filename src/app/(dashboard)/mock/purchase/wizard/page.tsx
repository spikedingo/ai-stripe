"use client";

import * as React from "react";
import {
  FormInput,
  Bot,
  Package,
  Settings2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  DollarSign,
  Target,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockAgentsForPurchase, mockThinkingChain, type ThinkingStep } from "@/lib/mock-data";

type WizardStep = "agent" | "product" | "conditions" | "confirm" | "executing";

interface FormData {
  agentId: string;
  productUrl: string;
  productName: string;
  targetPrice: string;
  maxPrice: string;
  autoApprove: boolean;
  notes: string;
}

const steps: { id: WizardStep; title: string; icon: React.ElementType }[] = [
  { id: "agent", title: "Select Agent", icon: Bot },
  { id: "product", title: "Product Info", icon: Package },
  { id: "conditions", title: "Conditions", icon: Settings2 },
  { id: "confirm", title: "Confirm", icon: CheckCircle2 },
];

export default function WizardPurchasePage() {
  const [currentStep, setCurrentStep] = React.useState<WizardStep>("agent");
  const [formData, setFormData] = React.useState<FormData>({
    agentId: "",
    productUrl: "",
    productName: "",
    targetPrice: "",
    maxPrice: "",
    autoApprove: false,
    notes: "",
  });
  const [isValidating, setIsValidating] = React.useState(false);
  const [executionSteps, setExecutionSteps] = React.useState<ThinkingStep[]>([]);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const selectedAgent = mockAgentsForPurchase.find((a) => a.id === formData.agentId);

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    
    if (currentStep === "product") {
      // Simulate URL validation
      setIsValidating(true);
      await new Promise((r) => setTimeout(r, 1000));
      setIsValidating(false);
      
      // Auto-fill product name from URL
      if (formData.productUrl && !formData.productName) {
        updateForm({ productName: "Sony WH-1000XM5 Wireless Headphones" });
      }
    }

    if (currentStep === "confirm") {
      // Start execution
      setCurrentStep("executing");
      simulateExecution();
      return;
    }

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
    const steps = [...mockThinkingChain];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      steps[i] = { ...steps[i], status: i < 3 ? "completed" : steps[i].status };
      setExecutionSteps([...steps]);
      
      if (steps[i].status === "waiting_approval") break;
    }
  };

  const handleApprove = async () => {
    const steps = [...executionSteps];
    
    // Find and complete the approval step
    const approvalIndex = steps.findIndex((s) => s.status === "waiting_approval");
    if (approvalIndex >= 0) {
      steps[approvalIndex] = { ...steps[approvalIndex], status: "completed" };
      setExecutionSteps([...steps]);
    }
    
    // Continue with remaining steps
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
      case "product":
        return !!formData.productUrl || !!formData.productName;
      case "conditions":
        return !!formData.targetPrice;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <FormInput className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Form Wizard Style
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Step-by-step guided form for configuring purchase parameters with validation at each stage.
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep !== "executing" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStepIndex > index;

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
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
                    <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                    <span className="text-sm font-medium sm:hidden">{index + 1}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-0.5 transition-colors",
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
                    Select an Agent
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Choose which AI agent will handle this purchase
                  </p>
                </div>

                <div className="grid gap-3">
                  {mockAgentsForPurchase.map((agent) => (
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
                          Budget: ${agent.dailyBudget}/day
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Product Info */}
            {currentStep === "product" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Product Information
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Enter the product URL or describe what you want to buy
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">
                      Product URL
                    </label>
                    <div className="relative">
                      <Input
                        value={formData.productUrl}
                        onChange={(e) => updateForm({ productUrl: e.target.value })}
                        placeholder="https://amazon.com/dp/..."
                        className="pr-10"
                      />
                      {isValidating && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-primary animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      Paste a product link from Amazon, Best Buy, Walmart, etc.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border-subtle" />
                    <span className="text-xs text-text-tertiary">OR</span>
                    <div className="flex-1 h-px bg-border-subtle" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">
                      Product Name / Description
                    </label>
                    <Textarea
                      value={formData.productName}
                      onChange={(e) => updateForm({ productName: e.target.value })}
                      placeholder="Describe the product you want to buy..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Conditions */}
            {currentStep === "conditions" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Purchase Conditions
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Set price targets and approval preferences
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">
                      <Target className="h-3.5 w-3.5 inline mr-1" />
                      Target Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                      <Input
                        type="number"
                        value={formData.targetPrice}
                        onChange={(e) => updateForm({ targetPrice: e.target.value })}
                        placeholder="320.00"
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      Buy when price drops to this level
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">
                      <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                      Maximum Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                      <Input
                        type="number"
                        value={formData.maxPrice}
                        onChange={(e) => updateForm({ maxPrice: e.target.value })}
                        placeholder="400.00"
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      Never buy above this price
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-bg-tertiary">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoApprove}
                      onChange={(e) => updateForm({ autoApprove: e.target.checked })}
                      className="h-4 w-4 rounded border-border-default text-accent-primary focus:ring-accent-primary"
                    />
                    <div>
                      <p className="font-medium text-text-primary">Auto-approve purchase</p>
                      <p className="text-xs text-text-tertiary">
                        Skip manual approval when conditions are met
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1.5">
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateForm({ notes: e.target.value })}
                    placeholder="Any special instructions for the agent..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {currentStep === "confirm" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Review & Confirm
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Review your purchase request before submitting
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
                      <Package className="h-5 w-5 text-accent-primary" />
                      <span className="font-medium text-text-primary">Product</span>
                    </div>
                    <p className="text-text-primary">
                      {formData.productName || "Product from URL"}
                    </p>
                    {formData.productUrl && (
                      <p className="text-xs text-text-tertiary mt-1 truncate">
                        {formData.productUrl}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-bg-tertiary">
                    <div className="flex items-center gap-3 mb-3">
                      <Settings2 className="h-5 w-5 text-accent-primary" />
                      <span className="font-medium text-text-primary">Conditions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-text-tertiary">Target Price</p>
                        <p className="font-medium text-success">${formData.targetPrice || "—"}</p>
                      </div>
                      <div>
                        <p className="text-text-tertiary">Max Price</p>
                        <p className="font-medium text-text-primary">${formData.maxPrice || "—"}</p>
                      </div>
                    </div>
                    <Badge variant={formData.autoApprove ? "success" : "warning"} className="mt-3">
                      {formData.autoApprove ? "Auto-approve enabled" : "Manual approval required"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Executing State */}
            {currentStep === "executing" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Processing Purchase Request
                  </h3>
                </div>

                <div className="space-y-2">
                  {executionSteps.map((step, index) => (
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
                        <p className={cn(
                          "font-medium",
                          step.status === "completed" || step.status === "in_progress"
                            ? "text-text-primary"
                            : "text-text-tertiary"
                        )}>
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
                      Approve Purchase
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
                      Start Purchase
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

