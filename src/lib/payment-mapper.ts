/**
 * Payment Mapper
 * Maps technical concepts (Agent, Activity, Task) to business concepts (Payment Channel, Transaction, Payment Rule)
 */

import type { Agent, ActivityEvent, AgentTask } from "@/types";

// Payment Channel (mapped from Agent)
export interface PaymentChannel {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "stopped";
  paymentRules: PaymentRule[];
  merchantSupport: string[];
  x402Integration: boolean;
  transactionLimits: {
    maxAmount: number;
    requireApprovalAbove: number;
    dailyLimit: number;
    weeklyLimit: number;
  };
  approvalWorkflow: {
    requireApprovalAbove: number;
  };
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

// Payment Transaction (mapped from ActivityEvent)
export interface PaymentTransaction {
  id: string;
  type: "payment_402" | "transaction_completed" | "approval_requested" | "approval_granted" | "approval_rejected";
  status: "success" | "pending" | "failed";
  amount?: number;
  currency: "USDC";
  merchant?: string;
  paymentChannel?: string;
  channelId?: string;
  txHash?: string;
  x402ProtocolCall: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  createdAt: string;
  description: string;
}

// Payment Rule (mapped from AgentTask)
export interface PaymentRule {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  schedule: string | null; // cron expression or minutes
  prompt: string;
  hasMemory: boolean;
}

/**
 * Map Agent to Payment Channel
 */
export function mapAgentToChannel(agent: Agent, tasks: AgentTask[] = []): PaymentChannel {
  // Count x402 usage from activity events (would need to be passed separately)
  // For now, assume x402 is enabled if agent has payment capabilities
  const x402Integration = agent.permissions.canCheckout;

  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    status: agent.status,
    paymentRules: tasks.map(mapTaskToPaymentRule),
    merchantSupport: agent.allowedMerchants || [],
    x402Integration,
    transactionLimits: {
      maxAmount: agent.permissions.maxTransactionAmount,
      requireApprovalAbove: agent.permissions.requireApprovalAbove,
      dailyLimit: agent.budget.dailyLimit,
      weeklyLimit: agent.budget.weeklyLimit,
    },
    approvalWorkflow: {
      requireApprovalAbove: agent.permissions.requireApprovalAbove,
    },
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
    lastActiveAt: agent.lastActiveAt,
  };
}

/**
 * Map ActivityEvent to PaymentTransaction
 */
export function mapActivityToTransaction(event: ActivityEvent): PaymentTransaction | null {
  // Only map payment-related events
  const paymentEventTypes: ActivityEvent["type"][] = [
    "payment_402",
    "transaction_completed",
    "approval_requested",
    "approval_granted",
    "approval_rejected",
  ];

  if (!paymentEventTypes.includes(event.type)) {
    return null;
  }

  const isX402 = event.type === "payment_402";
  const isCompleted = event.type === "transaction_completed";
  const isApprovalRequested = event.type === "approval_requested";
  const isApprovalGranted = event.type === "approval_granted";
  const isApprovalRejected = event.type === "approval_rejected";

  let status: "success" | "pending" | "failed" = "pending";
  if (isCompleted || isApprovalGranted) {
    status = "success";
  } else if (isApprovalRejected) {
    status = "failed";
  } else if (isApprovalRequested) {
    status = "pending";
  }

  const amount = event.metadata?.amount as number | undefined;
  const merchant = event.metadata?.merchant as string | undefined;
  const txHash = event.metadata?.txHash as string | undefined;

  return {
    id: event.id,
    type: event.type as PaymentTransaction["type"],
    status,
    amount,
    currency: "USDC",
    merchant,
    paymentChannel: event.agentName,
    channelId: event.agentId,
    txHash,
    x402ProtocolCall: isX402,
    approvalStatus: isApprovalRequested
      ? "pending"
      : isApprovalGranted
        ? "approved"
        : isApprovalRejected
          ? "rejected"
          : undefined,
    createdAt: event.createdAt,
    description: event.description,
  };
}

/**
 * Map AgentTask to PaymentRule
 */
export function mapTaskToPaymentRule(task: AgentTask): PaymentRule {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    enabled: task.enabled,
    schedule: task.cron || (task.minutes ? `Every ${task.minutes} minutes` : null),
    prompt: task.prompt,
    hasMemory: task.has_memory,
  };
}

/**
 * Filter payment-related events from activity events
 */
export function filterPaymentEvents(events: ActivityEvent[]): ActivityEvent[] {
  const paymentEventTypes: ActivityEvent["type"][] = [
    "payment_402",
    "transaction_completed",
    "approval_requested",
    "approval_granted",
    "approval_rejected",
  ];

  return events.filter((event) => paymentEventTypes.includes(event.type));
}
