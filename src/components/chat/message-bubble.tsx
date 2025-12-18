"use client";

import * as React from "react";
import { Bot, User, CheckCircle, Circle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Message, ExecutionPlan, ApprovalRequest } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
}

export function MessageBubble({ message, onApprove, onReject }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("max-w-3xl mx-auto px-4 py-3 animate-fade-in-up")}>
      <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <Avatar fallback="U" size="sm" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-accent-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-text-inverse" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn("flex-1 space-y-3", isUser && "flex flex-col items-end")}>
          {/* Message Text */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 max-w-[85%]",
              isUser ? "bg-accent-primary text-text-inverse" : "bg-bg-tertiary text-text-primary"
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

          {/* Execution Plan */}
          {isAssistant && message.metadata?.plan && (
            <ExecutionPlanCard plan={message.metadata.plan} />
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

// Execution Plan Card
function ExecutionPlanCard({ plan }: { plan: ExecutionPlan }) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-accent-primary animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return <Circle className="h-4 w-4 text-text-tertiary" />;
    }
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

        <div className="space-y-2">
          {plan.steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5">{getStepIcon(step.status)}</div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm",
                    step.status === "completed"
                      ? "text-text-secondary line-through"
                      : step.status === "in_progress"
                      ? "text-text-primary font-medium"
                      : "text-text-secondary"
                  )}
                >
                  {index + 1}. {step.name}
                </p>
                {step.estimatedCost !== undefined && step.estimatedCost > 0 && (
                  <p className="text-xs text-text-tertiary">
                    Est. cost: ${step.estimatedCost.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
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
    <Card className="max-w-md border-warning/50">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-warning" />
          </div>
          <div className="flex-1">
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
              <Button size="sm" onClick={() => onApprove?.(approval.id)}>
                Approve
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onReject?.(approval.id)}>
                Reject
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

