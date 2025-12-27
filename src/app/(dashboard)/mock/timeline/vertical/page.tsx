"use client";

import * as React from "react";
import {
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bot,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mockThinkingChain,
  mockPurchaseOrders,
  formatDuration,
  type ThinkingStep,
} from "@/lib/mock-data";

export default function VerticalTimelinePage() {
  const [steps, setSteps] = React.useState<ThinkingStep[]>(mockThinkingChain);
  const [isRunning, setIsRunning] = React.useState(false);
  const [expandedStep, setExpandedStep] = React.useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(-1);

  const order = mockPurchaseOrders[0];

  const handleStart = () => {
    setIsRunning(true);
    setSteps(mockThinkingChain.map((s) => ({ ...s, status: "pending" })));
    setCurrentStepIndex(0);
    simulateProgress();
  };

  const handleReset = () => {
    setIsRunning(false);
    setSteps(mockThinkingChain);
    setCurrentStepIndex(-1);
  };

  const simulateProgress = async () => {
    const newSteps: ThinkingStep[] = mockThinkingChain.map((s) => ({ ...s, status: "pending" as ThinkingStep["status"] }));
    
    for (let i = 0; i < newSteps.length; i++) {
      setCurrentStepIndex(i);
      
      // Set current step to in_progress
      newSteps[i] = { ...newSteps[i], status: "in_progress" };
      setSteps([...newSteps]);
      
      // Wait for step duration
      await new Promise((r) => setTimeout(r, newSteps[i].duration || 1000));
      
      // Complete or set to waiting
      if (mockThinkingChain[i].status === "waiting_approval") {
        newSteps[i] = { ...newSteps[i], status: "waiting_approval" };
        setSteps([...newSteps]);
        setIsRunning(false);
        return;
      } else {
        newSteps[i] = { ...newSteps[i], status: "completed" };
        setSteps([...newSteps]);
      }
    }
    
    setIsRunning(false);
  };

  const handleApprove = async () => {
    setIsRunning(true);
    const newSteps = [...steps];
    
    // Mark approval step as completed
    const approvalIndex = newSteps.findIndex((s) => s.status === "waiting_approval");
    if (approvalIndex >= 0) {
      newSteps[approvalIndex] = { ...newSteps[approvalIndex], status: "completed" };
      setSteps([...newSteps]);
    }
    
    // Continue with remaining steps
    for (let i = approvalIndex + 1; i < newSteps.length; i++) {
      setCurrentStepIndex(i);
      newSteps[i] = { ...newSteps[i], status: "in_progress" };
      setSteps([...newSteps]);
      
      await new Promise((r) => setTimeout(r, newSteps[i].duration || 1000));
      
      newSteps[i] = { ...newSteps[i], status: "completed" };
      setSteps([...newSteps]);
    }
    
    setIsRunning(false);
  };

  const getStepIcon = (status: ThinkingStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />;
      case "waiting_approval":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-error" />;
      default:
        return <Clock className="h-5 w-5 text-text-tertiary" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <GitBranch className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Vertical Timeline Style
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Classic timeline layout with each step displayed as a node. Perfect for detailed
            step-by-step visualization with real-time updates.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Purchase Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-text-primary">{order.productName}</p>
                <p className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                  <ExternalLink className="h-3 w-3" />
                  {order.merchant}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-bg-tertiary">
                  <p className="text-xs text-text-tertiary">Current Price</p>
                  <p className="font-semibold text-text-primary">${order.currentPrice}</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <p className="text-xs text-text-tertiary">Target Price</p>
                  <p className="font-semibold text-success">${order.targetPrice}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-tertiary">
                <Bot className="h-4 w-4 text-accent-primary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{order.agentName}</p>
                  <p className="text-xs text-text-tertiary">Handling this purchase</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleStart}
                  disabled={isRunning}
                  className="flex-1 gap-2"
                >
                  <Play className="h-4 w-4" />
                  {currentStepIndex === -1 ? "Start" : "Resume"}
                </Button>
                <Button variant="secondary" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Thinking Chain</CardTitle>
                <Badge variant={isRunning ? "info" : "default"}>
                  {isRunning
                    ? "Processing..."
                    : steps.every((s) => s.status === "completed")
                    ? "Completed"
                    : "Ready"}
                </Badge>
              </div>
              <CardDescription>
                Real-time visualization of the agent&apos;s decision-making process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border-subtle" />

                {/* Steps */}
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Step Content */}
                      <div
                        className={cn(
                          "flex gap-4 p-4 rounded-lg ml-10 transition-all cursor-pointer",
                          step.status === "completed" && "bg-success/5",
                          step.status === "in_progress" && "bg-accent-primary/5 ring-1 ring-accent-primary/20",
                          step.status === "waiting_approval" && "bg-warning/10 ring-1 ring-warning/20",
                          step.status === "pending" && "bg-bg-secondary",
                          step.status === "failed" && "bg-error/5"
                        )}
                        onClick={() =>
                          setExpandedStep(expandedStep === step.id ? null : step.id)
                        }
                      >
                        {/* Icon */}
                        <div className="absolute left-0 top-4 h-10 w-10 rounded-full bg-bg-primary border-2 border-border-subtle flex items-center justify-center z-10">
                          {getStepIcon(step.status)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-text-primary">{step.title}</p>
                              <p className="text-sm text-text-secondary mt-0.5">
                                {step.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {step.duration && step.status === "completed" && (
                                <span className="text-xs text-text-tertiary">
                                  {formatDuration(step.duration)}
                                </span>
                              )}
                              {expandedStep === step.id ? (
                                <ChevronUp className="h-4 w-4 text-text-tertiary" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-text-tertiary" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedStep === step.id && step.details && (
                            <div className="mt-3 pt-3 border-t border-border-subtle">
                              <p className="text-sm text-text-secondary">{step.details}</p>
                              
                              {step.metadata && (
                                <div className="mt-2 p-2 rounded bg-bg-tertiary">
                                  <pre className="text-xs text-text-tertiary overflow-x-auto">
                                    {JSON.stringify(step.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Approval Actions */}
                          {step.status === "waiting_approval" && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-border-subtle">
                              <Button variant="secondary" size="sm" className="flex-1">
                                Reject
                              </Button>
                              <Button size="sm" className="flex-1" onClick={handleApprove}>
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {steps.every((s) => s.status === "completed") && (
                <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <div>
                      <p className="font-medium text-success">Purchase Complete!</p>
                      <p className="text-sm text-text-secondary">
                        All steps executed successfully. Transaction confirmed on-chain.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Duration Tracking</h3>
              <p className="text-sm text-text-secondary">
                Shows exact time taken for each step in the process
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ChevronDown className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Expandable Details</h3>
              <p className="text-sm text-text-secondary">
                Click any step to see detailed information and metadata
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <AlertCircle className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Approval Points</h3>
              <p className="text-sm text-text-secondary">
                Clear visual indication when human approval is needed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

