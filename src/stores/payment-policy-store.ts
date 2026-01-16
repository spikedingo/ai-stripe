import { create } from "zustand";
import type { Agent, AgentTask } from "@/types";
import { mapAgentToChannel, type PaymentRule } from "@/lib/payment-mapper";

export interface PaymentPolicy {
  id: string;
  name: string;
  description: string;
  channelId: string;
  channelName: string;
  paymentRules: PaymentRule[];
  transactionLimits: {
    maxAmount: number;
    requireApprovalAbove: number;
    dailyLimit: number;
    weeklyLimit: number;
  };
  approvalWorkflow: {
    requireApprovalAbove: number;
  };
  merchantWhitelist: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaymentPolicyState {
  policies: PaymentPolicy[];
  isLoading: boolean;
}

interface PaymentPolicyActions {
  fetchPolicies: (agents: Agent[], tasksMap: Record<string, AgentTask[]>) => void;
  getPolicyByChannelId: (channelId: string) => PaymentPolicy | undefined;
}

type PaymentPolicyStore = PaymentPolicyState & PaymentPolicyActions;

// Mock policies for demonstration
const mockPolicies: PaymentPolicy[] = [
  {
    id: "policy_1",
    name: "Standard Payment Policy",
    description: "Default payment policy with standard limits and approval workflow",
    channelId: "agent_1",
    channelName: "Deal Hunter",
    paymentRules: [],
    transactionLimits: {
      maxAmount: 200,
      requireApprovalAbove: 50,
      dailyLimit: 100,
      weeklyLimit: 500,
    },
    approvalWorkflow: {
      requireApprovalAbove: 50,
    },
    merchantWhitelist: ["amazon.com", "bestbuy.com"],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const usePaymentPolicyStore = create<PaymentPolicyStore>((set, get) => ({
  policies: [],
  isLoading: false,

  fetchPolicies: (agents, tasksMap) => {
    set({ isLoading: true });

    // Map agents and tasks to policies
    const policies: PaymentPolicy[] = agents.map((agent) => {
      const tasks = tasksMap[agent.id] || [];
      const channel = mapAgentToChannel(agent, tasks);

      return {
        id: `policy_${agent.id}`,
        name: `${agent.name} Payment Policy`,
        description: `Payment policy for ${agent.name}`,
        channelId: agent.id,
        channelName: agent.name,
        paymentRules: channel.paymentRules,
        transactionLimits: channel.transactionLimits,
        approvalWorkflow: channel.approvalWorkflow,
        merchantWhitelist: channel.merchantSupport,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      };
    });

    // Add mock policies if no real policies exist
    if (policies.length === 0) {
      set({
        policies: mockPolicies,
        isLoading: false,
      });
    } else {
      set({
        policies,
        isLoading: false,
      });
    }
  },

  getPolicyByChannelId: (channelId) => {
    const { policies } = get();
    return policies.find((p) => p.channelId === channelId);
  },
}));
