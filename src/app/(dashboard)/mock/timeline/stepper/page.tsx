"use client";

import * as React from "react";
import {
  List,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
  Bot,
  DollarSign,
  ShoppingCart,
  ExternalLink,
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

interface LogEntry {
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
  stepId?: string;
}

export default function StepperTimelinePage() {
  const [steps, setSteps] = React.useState<ThinkingStep[]>(mockThinkingChain);
  const [isRunning, setIsRunning] = React.useState(false);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(-1);
  const logsEndRef = React.useRef<HTMLDivElement>(null);

  const order = mockPurchaseOrders[0];

  // Auto-scroll logs
  React.useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (level: LogEntry["level"], message: string, stepId?: string) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        stepId,
      },
    ]);
  };

  const handleStart = () => {
    setIsRunning(true);
    setLogs([]);
    setSteps(mockThinkingChain.map((s) => ({ ...s, status: "pending" })));
    setCurrentStepIndex(0);
    addLog("info", "Starting purchase process...");
    simulateProgress();
  };

  const handleReset = () => {
    setIsRunning(false);
    setSteps(mockThinkingChain);
    setCurrentStepIndex(-1);
    setLogs([]);
  };

  const simulateProgress = async () => {
    const newSteps: ThinkingStep[] = mockThinkingChain.map((s) => ({ ...s, status: "pending" as const }));
    
    for (let i = 0; i < newSteps.length; i++) {
      setCurrentStepIndex(i);
      
      // Set current step to in_progress
      newSteps[i] = { ...newSteps[i], status: "in_progress" as ThinkingStep["status"] };
      setSteps([...newSteps]);
      addLog("info", `Starting: ${newSteps[i].title}`, newSteps[i].id);
      
      // Wait for step duration
      await new Promise((r) => setTimeout(r, newSteps[i].duration || 1000));
      
      // Complete or set to waiting
      if (mockThinkingChain[i].status === "waiting_approval") {
        newSteps[i] = { ...newSteps[i], status: "waiting_approval" as ThinkingStep["status"] };
        setSteps([...newSteps]);
        addLog("warning", `Approval required: ${newSteps[i].details}`, newSteps[i].id);
        setIsRunning(false);
        return;
      } else {
        newSteps[i] = { ...newSteps[i], status: "completed" as ThinkingStep["status"] };
        setSteps([...newSteps]);
        addLog("success", `Completed: ${newSteps[i].title}`, newSteps[i].id);
      }
    }
    
    addLog("success", "Purchase process completed successfully!");
    setIsRunning(false);
  };

  const handleApprove = async () => {
    addLog("info", "User approved the purchase");
    setIsRunning(true);
    const newSteps = [...steps];
    
    // Mark approval step as completed
    const approvalIndex = newSteps.findIndex((s) => s.status === "waiting_approval");
    if (approvalIndex >= 0) {
      newSteps[approvalIndex] = { ...newSteps[approvalIndex], status: "completed" };
      setSteps([...newSteps]);
      addLog("success", `Completed: ${newSteps[approvalIndex].title}`, newSteps[approvalIndex].id);
    }
    
    // Continue with remaining steps
    for (let i = approvalIndex + 1; i < newSteps.length; i++) {
      setCurrentStepIndex(i);
      newSteps[i] = { ...newSteps[i], status: "in_progress" };
      setSteps([...newSteps]);
      addLog("info", `Starting: ${newSteps[i].title}`, newSteps[i].id);
      
      await new Promise((r) => setTimeout(r, newSteps[i].duration || 1000));
      
      newSteps[i] = { ...newSteps[i], status: "completed" };
      setSteps([...newSteps]);
      addLog("success", `Completed: ${newSteps[i].title}`, newSteps[i].id);
    }
    
    addLog("success", "Purchase process completed successfully!");
    setIsRunning(false);
  };

  const getStepperState = (step: ThinkingStep, index: number) => {
    if (step.status === "completed") return "completed";
    if (step.status === "in_progress") return "active";
    if (step.status === "waiting_approval") return "warning";
    if (step.status === "failed") return "error";
    return "pending";
  };

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <List className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Horizontal Stepper Style
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Compact progress visualization with a horizontal stepper bar and detailed log panel below.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Order Info */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Order Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-text-primary text-sm">{order.productName}</p>
                <p className="text-xs text-text-tertiary">{order.merchant}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">${order.currentPrice}</Badge>
                <Badge variant="success">${order.targetPrice} target</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Bot className="h-3 w-3" />
                {order.agentName}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleStart}
                  disabled={isRunning}
                  className="flex-1 gap-1"
                >
                  <Play className="h-3 w-3" />
                  Start
                </Button>
                <Button size="sm" variant="secondary" onClick={handleReset}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stepper and Logs */}
          <div className="lg:col-span-3 space-y-4">
            {/* Horizontal Stepper */}
            <Card>
              <CardContent className="py-6">
                {/* Progress Bar */}
                <div className="relative mb-6">
                  <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-text-tertiary">
                      {completedCount} of {steps.length} steps
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const state = getStepperState(step, index);
                    
                    return (
                      <React.Fragment key={step.id}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                              state === "completed" && "bg-success text-white",
                              state === "active" && "bg-accent-primary text-white ring-4 ring-accent-primary/20",
                              state === "warning" && "bg-warning text-white ring-4 ring-warning/20",
                              state === "error" && "bg-error text-white",
                              state === "pending" && "bg-bg-tertiary text-text-tertiary"
                            )}
                          >
                            {state === "completed" && <CheckCircle2 className="h-5 w-5" />}
                            {state === "active" && <Loader2 className="h-5 w-5 animate-spin" />}
                            {state === "warning" && <AlertCircle className="h-5 w-5" />}
                            {state === "error" && <AlertCircle className="h-5 w-5" />}
                            {state === "pending" && <span className="text-sm font-medium">{index + 1}</span>}
                          </div>
                          <p
                            className={cn(
                              "text-xs mt-2 text-center max-w-[80px] truncate",
                              state === "active" || state === "warning"
                                ? "text-text-primary font-medium"
                                : "text-text-tertiary"
                            )}
                            title={step.title}
                          >
                            {step.title.split(" ").slice(0, 2).join(" ")}
                          </p>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                          <div
                            className={cn(
                              "flex-1 h-0.5 mx-2",
                              steps[index + 1].status !== "pending" ||
                              step.status === "completed"
                                ? "bg-accent-primary"
                                : "bg-bg-tertiary"
                            )}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Approval Actions */}
                {steps.some((s) => s.status === "waiting_approval") && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-border-subtle">
                    <div className="flex-1">
                      <p className="text-sm text-warning font-medium">Approval Required</p>
                      <p className="text-xs text-text-secondary">
                        {steps.find((s) => s.status === "waiting_approval")?.details}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Reject
                    </Button>
                    <Button size="sm" onClick={handleApprove}>
                      Approve
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Log Panel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Execution Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-y-auto bg-bg-secondary rounded-lg p-3 font-mono text-xs">
                  {logs.length === 0 ? (
                    <p className="text-text-tertiary">
                      Click &quot;Start&quot; to begin the purchase process...
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-text-tertiary flex-shrink-0">
                            [{log.timestamp}]
                          </span>
                          <span
                            className={cn(
                              log.level === "success" && "text-success",
                              log.level === "warning" && "text-warning",
                              log.level === "error" && "text-error",
                              log.level === "info" && "text-text-secondary"
                            )}
                          >
                            {log.message}
                          </span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <List className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Compact Overview</h3>
              <p className="text-sm text-text-secondary">
                See all steps at a glance with minimal screen space
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Terminal className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Detailed Logs</h3>
              <p className="text-sm text-text-secondary">
                Terminal-style log panel for debugging and transparency
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <CheckCircle2 className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Progress Tracking</h3>
              <p className="text-sm text-text-secondary">
                Clear progress bar showing completion percentage
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

