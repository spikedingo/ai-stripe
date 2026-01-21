"use client";

import * as React from "react";
import { Bot, User, CheckCircle, Circle, AlertCircle, Loader2, ShieldAlert, ChevronRight, Code, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FoodOrderCard } from "@/components/chat/food-order-card";
import { FlightCard } from "@/components/chat/flight-card";
import { useChatStore } from "@/stores";
import type { Message, ExecutionPlan, ApprovalRequest } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
}

export function MessageBubble({ message, onApprove, onReject }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  // Get current plan from store to show real-time updates
  const currentPlan = useChatStore((state) => state.currentPlan);

  // Use currentPlan if it matches the message's plan ID, otherwise use the static plan from message
  const displayPlan = React.useMemo(() => {
    if (message.metadata?.plan && currentPlan && message.metadata.plan.id === currentPlan.id) {
      return currentPlan;
    }
    return message.metadata?.plan;
  }, [message.metadata?.plan, currentPlan]);

  return (
    <div className={cn("max-w-3xl mx-auto px-4 py-3 animate-fade-in-up")}>
      <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
        {/* Avatar */}
        {!message.metadata?.author_type || message.metadata?.author_type !== "system" ? (
          <div className="flex-shrink-0 mt-1">
            {isUser ? (
              <Avatar fallback="U" size="sm" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-accent-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-text-inverse" />
              </div>
            )}
          </div>
        ) : null}

        {/* Content */}
        <div className={cn("flex-1 space-y-3", isUser && "flex flex-col items-end")}>
          {/* Message Text */}
          {message.content && (
            <div
              className={cn(
                "rounded-2xl px-4 py-3 max-w-[85%]",
                isUser ? "bg-accent-primary text-text-inverse" : "bg-bg-tertiary text-text-primary",
                message.metadata?.author_type === "system" && "bg-transparent border border-warning/50 text-warning max-w-full italic text-center py-2 px-6 rounded-lg"
              )}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content.split("\n").map((line, i) => {
                  // Handle bold text
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  const parts = [];
                  let lastIndex = 0;
                  let match;

                  while ((match = boldRegex.exec(line)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(line.slice(lastIndex, match.index));
                    }
                    parts.push(
                      <strong key={match.index} className="font-semibold">
                        {match[1]}
                      </strong>
                    );
                    lastIndex = match.index + match[0].length;
                  }

                  if (lastIndex < line.length) {
                    parts.push(line.slice(lastIndex));
                  }

                  return (
                    <React.Fragment key={i}>
                      {parts.length > 0 ? parts : line}
                      {i < message.content.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skill Calls */}
          {message.metadata?.skill_calls && (message.metadata.skill_calls as any[]).length > 0 && (
            <SkillCallsCard skillCalls={message.metadata.skill_calls as any[]} />
          )}

          {/* Food Order Card */}
          {isAssistant && message.metadata?.foodOrder && (
            <FoodOrderCard foodOrder={message.metadata.foodOrder} />
          )}

          {/* Flight Booking Card */}
          {isAssistant && message.metadata?.flightBooking && (
            <FlightCard flightBooking={message.metadata.flightBooking} />
          )}

          {/* Execution Plan */}
          {isAssistant && displayPlan && (
            <ExecutionPlanCard plan={displayPlan} />
          )}

          {/* Approval Request */}
          {isAssistant && message.metadata?.approval && (
            <ApprovalCard
              approval={message.metadata.approval}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Skill Calls Card
function SkillCallsCard({ skillCalls }: { skillCalls: any[] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const successCount = skillCalls.filter(call => call.success).length;
  const totalCount = skillCalls.length;
  const allSuccess = successCount === totalCount;
  const someSuccess = successCount > 0;

  return (
    <Card className="max-w-md border-border-subtle bg-bg-secondary/40 overflow-hidden shadow-sm">
      <div className="p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left transition-opacity hover:opacity-80"
        >
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full shrink-0",
              allSuccess ? "bg-success/15 text-success" : someSuccess ? "bg-warning/15 text-warning" : "bg-error/15 text-error"
            )}>
              {allSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            </div>
            <div>
              <span className="text-sm font-semibold text-text-primary">
                Skills Called
              </span>
              <p className="text-[10px] text-text-tertiary">
                {successCount} of {totalCount} successful
              </p>
            </div>
          </div>
          <ChevronRight className={cn("h-4 w-4 text-text-tertiary transition-transform duration-200", isExpanded && "rotate-90")} />
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-4 pt-4 border-t border-border-subtle animate-in fade-in slide-in-from-top-1">
            {skillCalls.map((call, idx) => (
              <div key={call.id || idx} className="space-y-2 last:mb-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-3 w-3 text-accent-primary" />
                    <span className="text-xs font-mono font-medium text-text-secondary truncate max-w-[180px]">
                      {call.name}
                    </span>
                  </div>
                  <Badge variant={call.success ? "success" : "error"} className="text-[9px] px-1.5 py-0 min-w-[50px] justify-center">
                    {call.success ? "Success" : "Failed"}
                  </Badge>
                </div>

                {call.parameters && Object.keys(call.parameters).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-medium text-text-tertiary ml-1">Input Parameters:</div>
                    <div className="text-[10px] bg-bg-primary/50 border border-border-subtle p-2 rounded-md overflow-x-auto custom-scrollbar">
                      <pre className="text-text-secondary font-mono leading-tight whitespace-pre-wrap break-all">
                        {JSON.stringify(call.parameters, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {call.response && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-medium text-text-tertiary ml-1">Output Result:</div>
                    <div className="text-[10px] bg-bg-primary/50 border border-border-subtle p-2 rounded-md overflow-x-auto custom-scrollbar">
                      <pre className="text-text-secondary font-mono leading-tight whitespace-pre-wrap break-all">
                        {typeof call.response === 'string' ? call.response : JSON.stringify(call.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// Execution Plan Card
function ExecutionPlanCard({ plan }: { plan: ExecutionPlan }) {
  const getStepIcon = (status: string, isSensitive: boolean) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-accent-primary animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-error" />;
      case "awaiting_approval":
        return <ShieldAlert className="h-4 w-4 text-warning" />;
      default:
        return isSensitive
          ? <ShieldAlert className="h-4 w-4 text-text-tertiary" />
          : <Circle className="h-4 w-4 text-text-tertiary" />;
    }
  };

  // Check if step is sensitive based on description
  const isSensitiveStep = (description: string) => {
    return description.includes("⚠️") || description.toLowerCase().includes("sensitive");
  };

  return (
    <Card className="max-w-md">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-text-primary">{plan.title}</h4>
          <Badge
            variant={
              plan.status === "completed"
                ? "success"
                : plan.status === "executing"
                  ? "info"
                  : "default"
            }
          >
            {plan.status}
          </Badge>
        </div>

        {/* Plan description if available */}
        {plan.description && (
          <p className="text-xs text-text-secondary mb-3">{plan.description}</p>
        )}

        <div className="space-y-2">
          {plan.steps.map((step, index) => {
            const sensitive = isSensitiveStep(step.description);
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 p-2 rounded-lg -mx-2",
                  step.status === "awaiting_approval" && "bg-warning/10",
                  sensitive && step.status === "pending" && "bg-bg-secondary"
                )}
              >
                <div className="mt-0.5">{getStepIcon(step.status, sensitive)}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm",
                      step.status === "completed"
                        ? "text-text-secondary line-through"
                        : step.status === "in_progress"
                          ? "text-text-primary font-medium"
                          : step.status === "awaiting_approval"
                            ? "text-warning font-medium"
                            : "text-text-secondary"
                    )}
                  >
                    {index + 1}. {step.name}
                    {sensitive && step.status !== "completed" && (
                      <span className="ml-2 text-xs text-warning">⚠️ Requires approval</span>
                    )}
                  </p>
                  {step.estimatedCost !== undefined && step.estimatedCost > 0 && (
                    <p className="text-xs text-text-tertiary">
                      x402 cost: ${step.estimatedCost.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {plan.totalEstimatedCost > 0 && (
          <div className="mt-3 pt-3 border-t border-border-subtle">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total Est. Cost</span>
              <span className="font-medium text-text-primary">
                ${plan.totalEstimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Approval Card
function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: {
  approval: ApprovalRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const isSensitiveAction = approval.type === "sensitive_action";
  const isTransaction = approval.type === "transaction";

  if (approval.status !== "pending") {
    return (
      <Card className="max-w-md">
        <div className="p-4">
          <div className="flex items-center gap-2">
            {approval.status === "approved" ? (
              <>
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-success">Approved</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-error" />
                <span className="text-sm text-error">Rejected</span>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "max-w-md",
      isSensitiveAction ? "border-error/50 bg-error/5" : "border-warning/50"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
            isSensitiveAction ? "bg-error/10" : "bg-warning/10"
          )}>
            {isSensitiveAction ? (
              <ShieldAlert className="h-4 w-4 text-error" />
            ) : (
              <AlertCircle className="h-4 w-4 text-warning" />
            )}
          </div>
          <div className="flex-1">
            {/* Type badge */}
            {(isSensitiveAction || isTransaction) && (
              <Badge
                variant={isSensitiveAction ? "error" : "warning"}
                className="text-xs mb-2"
              >
                {isSensitiveAction ? "Sensitive Action" : "Payment Required"}
              </Badge>
            )}

            <h4 className="font-medium text-text-primary">{approval.title}</h4>
            <p className="text-sm text-text-secondary mt-1">{approval.description}</p>

            {approval.amount !== undefined && (
              <div className="mt-2 p-2 rounded bg-bg-secondary">
                <span className="text-sm text-text-tertiary">Amount: </span>
                <span className="font-medium text-text-primary">
                  ${approval.amount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => onApprove?.(approval.id)}
                className={isSensitiveAction ? "bg-error hover:bg-error/80" : ""}
              >
                {isSensitiveAction ? "Confirm & Proceed" : "Approve"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onReject?.(approval.id)}>
                {isSensitiveAction ? "Cancel" : "Reject"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Typing Indicator
export function TypingIndicator() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-3">
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-accent-primary flex items-center justify-center">
          <Bot className="h-4 w-4 text-text-inverse" />
        </div>
        <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-bg-tertiary">
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

