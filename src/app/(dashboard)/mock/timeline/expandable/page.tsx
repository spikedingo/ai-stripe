"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Play,
  RotateCcw,
  Bot,
  ShoppingCart,
  ChevronsUpDown,
  ExternalLink,
  Copy,
  Check,
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

export default function ExpandableTimelinePage() {
  const [steps, setSteps] = React.useState<ThinkingStep[]>(mockThinkingChain);
  const [isRunning, setIsRunning] = React.useState(false);
  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(new Set());
  const [currentStepIndex, setCurrentStepIndex] = React.useState(-1);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const order = mockPurchaseOrders[0];

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (expandedSteps.size === steps.length) {
      setExpandedSteps(new Set());
    } else {
      setExpandedSteps(new Set(steps.map((s) => s.id)));
    }
  };

  const copyMetadata = (stepId: string, metadata: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopiedId(stepId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStart = () => {
    setIsRunning(true);
    setSteps(mockThinkingChain.map((s) => ({ ...s, status: "pending" })));
    setCurrentStepIndex(0);
    setExpandedSteps(new Set());
    simulateProgress();
  };

  const handleReset = () => {
    setIsRunning(false);
    setSteps(mockThinkingChain);
    setCurrentStepIndex(-1);
    setExpandedSteps(new Set());
  };

  const simulateProgress = async () => {
    const newSteps: ThinkingStep[] = mockThinkingChain.map((s) => ({ ...s, status: "pending" as const }));
    
    for (let i = 0; i < newSteps.length; i++) {
      setCurrentStepIndex(i);
      
      // Auto-expand current step
      setExpandedSteps((prev) => new Set([...prev, newSteps[i].id]));
      
      // Set current step to in_progress
      newSteps[i] = { ...newSteps[i], status: "in_progress" as ThinkingStep["status"] };
      setSteps([...newSteps]);
      
      // Wait for step duration
      await new Promise((r) => setTimeout(r, newSteps[i].duration || 1000));
      
      // Complete or set to waiting
      if (mockThinkingChain[i].status === "waiting_approval") {
        newSteps[i] = { ...newSteps[i], status: "waiting_approval" as ThinkingStep["status"] };
        setSteps([...newSteps]);
        setIsRunning(false);
        return;
      } else {
        newSteps[i] = { ...newSteps[i], status: "completed" as ThinkingStep["status"] };
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
      setExpandedSteps((prev) => new Set([...prev, newSteps[i].id]));
      
      newSteps[i] = { ...newSteps[i], status: "in_progress" };
      setSteps([...newSteps]);
      
      await new Promise((r) => setTimeout(r, newSteps[i].duration || 1000));
      
      newSteps[i] = { ...newSteps[i], status: "completed" };
      setSteps([...newSteps]);
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: ThinkingStep["status"]) => {
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

  const getStatusBadge = (status: ThinkingStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "in_progress":
        return <Badge variant="info">In Progress</Badge>;
      case "waiting_approval":
        return <Badge variant="warning">Needs Approval</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const completedCount = steps.filter((s) => s.status === "completed").length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <ChevronDown className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Expandable Cards Style
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Accordion-style collapsible cards that show summary by default and expand to reveal details.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary">
              <Bot className="h-4 w-4 text-accent-primary" />
              <span className="text-sm text-text-primary">{order.agentName}</span>
            </div>
            <Badge variant="outline">
              {completedCount}/{steps.length} steps
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleAll}
              className="gap-2"
            >
              <ChevronsUpDown className="h-4 w-4" />
              {expandedSteps.size === steps.length ? "Collapse All" : "Expand All"}
            </Button>
            <Button
              size="sm"
              onClick={handleStart}
              disabled={isRunning}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
            <Button size="sm" variant="secondary" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="bg-bg-secondary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-accent-primary" />
                <div>
                  <p className="font-medium text-text-primary">{order.productName}</p>
                  <p className="text-xs text-text-tertiary">{order.merchant}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Current: ${order.currentPrice}</p>
                  <p className="text-sm text-success font-medium">Target: ${order.targetPrice}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expandable Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.has(step.id);

            return (
              <Card
                key={step.id}
                className={cn(
                  "transition-all overflow-hidden",
                  step.status === "in_progress" && "ring-2 ring-accent-primary/30",
                  step.status === "waiting_approval" && "ring-2 ring-warning/30"
                )}
              >
                {/* Header - Always Visible */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full text-left"
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Step Number */}
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium",
                          step.status === "completed" && "bg-success/10 text-success",
                          step.status === "in_progress" && "bg-accent-primary/10 text-accent-primary",
                          step.status === "waiting_approval" && "bg-warning/10 text-warning",
                          step.status === "pending" && "bg-bg-tertiary text-text-tertiary"
                        )}
                      >
                        {step.status === "completed" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Title & Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{step.title}</CardTitle>
                          {getStatusBadge(step.status)}
                        </div>
                        {!isExpanded && (
                          <CardDescription className="text-sm mt-0.5 truncate">
                            {step.description}
                          </CardDescription>
                        )}
                      </div>

                      {/* Status Icon & Chevron */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {step.duration && step.status === "completed" && (
                          <span className="text-xs text-text-tertiary">
                            {formatDuration(step.duration)}
                          </span>
                        )}
                        {getStatusIcon(step.status)}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-text-tertiary" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-text-tertiary" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4 border-t border-border-subtle">
                    <div className="pt-4 space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-sm text-text-secondary">{step.description}</p>
                      </div>

                      {/* Details */}
                      {step.details && (
                        <div className="p-3 rounded-lg bg-bg-tertiary">
                          <p className="text-sm text-text-primary">{step.details}</p>
                        </div>
                      )}

                      {/* Metadata */}
                      {step.metadata && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-text-tertiary uppercase">
                              Metadata
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMetadata(step.id, step.metadata!)}
                              className="h-6 text-xs gap-1"
                            >
                              {copiedId === step.id ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <pre className="p-3 rounded-lg bg-bg-secondary text-xs text-text-secondary overflow-x-auto">
                            {JSON.stringify(step.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Approval Actions */}
                      {step.status === "waiting_approval" && (
                        <div className="flex gap-3 pt-2">
                          <Button variant="secondary" className="flex-1">
                            Reject
                          </Button>
                          <Button className="flex-1" onClick={handleApprove}>
                            Approve Purchase
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {steps.every((s) => s.status === "completed") && (
          <Card className="bg-success/10 border-success/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <div>
                  <p className="font-medium text-success">All Steps Completed!</p>
                  <p className="text-sm text-text-secondary">
                    Purchase has been successfully processed and settled on-chain.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <ChevronsUpDown className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Bulk Actions</h3>
              <p className="text-sm text-text-secondary">
                Expand or collapse all steps with a single click
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Copy className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Copy Metadata</h3>
              <p className="text-sm text-text-secondary">
                Easily copy step metadata for debugging or logging
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ChevronDown className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Progressive Disclosure</h3>
              <p className="text-sm text-text-secondary">
                Show only what&apos;s needed, expand for more details
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

