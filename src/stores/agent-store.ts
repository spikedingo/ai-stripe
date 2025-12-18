import { create } from "zustand";
import type { Agent, AgentTemplate, AgentStatus } from "@/types";
import { generateId } from "@/lib/utils";

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  isLoading: boolean;
}

interface AgentActions {
  fetchAgents: () => Promise<void>;
  createAgent: (name: string, template: AgentTemplate, description?: string) => Promise<Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  setSelectedAgent: (id: string | null) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => Promise<void>;
}

type AgentStore = AgentState & AgentActions;

// Default permissions by template
const templateDefaults: Record<AgentTemplate, Partial<Agent>> = {
  deal_hunter: {
    description: "Monitors prices and automatically purchases when target price is reached",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 200,
      requireApprovalAbove: 50,
      allowedCategories: ["electronics", "home", "fashion"],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 100,
      weeklyLimit: 500,
      monthlyLimit: 1000,
      perMerchantLimit: 200,
      spent: { daily: 0, weekly: 0, monthly: 0 },
    },
  },
  buyer: {
    description: "General purpose buyer agent for various purchases",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 500,
      requireApprovalAbove: 100,
      allowedCategories: [],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 200,
      weeklyLimit: 1000,
      monthlyLimit: 3000,
      perMerchantLimit: 500,
      spent: { daily: 0, weekly: 0, monthly: 0 },
    },
  },
  subscriber: {
    description: "Manages subscriptions and recurring payments",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 100,
      requireApprovalAbove: 30,
      allowedCategories: ["subscription", "software", "entertainment"],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 50,
      weeklyLimit: 100,
      monthlyLimit: 200,
      perMerchantLimit: 50,
      spent: { daily: 0, weekly: 0, monthly: 0 },
    },
  },
  custom: {
    description: "Custom agent with manual configuration",
    permissions: {
      canReadPages: true,
      canCheckout: false,
      maxTransactionAmount: 100,
      requireApprovalAbove: 0,
      allowedCategories: [],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 50,
      weeklyLimit: 200,
      monthlyLimit: 500,
      perMerchantLimit: 100,
      spent: { daily: 0, weekly: 0, monthly: 0 },
    },
  },
};

// Mock initial agents
const mockAgents: Agent[] = [
  {
    id: "agent_1",
    name: "Deal Hunter",
    description: "Monitors prices and automatically purchases when target price is reached",
    template: "deal_hunter",
    status: "active",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 200,
      requireApprovalAbove: 50,
      allowedCategories: ["electronics", "home"],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 100,
      weeklyLimit: 500,
      monthlyLimit: 1000,
      perMerchantLimit: 200,
      spent: { daily: 15.99, weekly: 15.99, monthly: 15.99 },
    },
    allowedMerchants: ["amazon.com", "bestbuy.com", "walmart.com"],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state
  agents: [],
  selectedAgentId: null,
  isLoading: false,

  // Actions
  fetchAgents: async () => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    set({
      agents: mockAgents,
      isLoading: false,
    });
  },

  createAgent: async (name: string, template: AgentTemplate, description?: string) => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const defaults = templateDefaults[template];
    const now = new Date().toISOString();

    const newAgent: Agent = {
      id: `agent_${generateId()}`,
      name,
      description: description || defaults.description || "",
      template,
      status: "active",
      permissions: defaults.permissions!,
      budget: defaults.budget!,
      allowedMerchants: [],
      createdAt: now,
      updatedAt: now,
    };

    const { agents } = get();
    set({
      agents: [...agents, newAgent],
      isLoading: false,
    });

    return newAgent;
  },

  updateAgent: async (id: string, updates: Partial<Agent>) => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { agents } = get();
    const updatedAgents = agents.map((agent) =>
      agent.id === id
        ? { ...agent, ...updates, updatedAt: new Date().toISOString() }
        : agent
    );

    set({
      agents: updatedAgents,
      isLoading: false,
    });
  },

  deleteAgent: async (id: string) => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { agents, selectedAgentId } = get();
    set({
      agents: agents.filter((agent) => agent.id !== id),
      selectedAgentId: selectedAgentId === id ? null : selectedAgentId,
      isLoading: false,
    });
  },

  setSelectedAgent: (id: string | null) => {
    set({ selectedAgentId: id });
  },

  updateAgentStatus: async (id: string, status: AgentStatus) => {
    const { agents } = get();
    const updatedAgents = agents.map((agent) =>
      agent.id === id
        ? { ...agent, status, updatedAt: new Date().toISOString() }
        : agent
    );

    set({ agents: updatedAgents });
  },
}));

