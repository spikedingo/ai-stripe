import { create } from "zustand";
import type { Agent, AgentTemplate, AgentStatus, Template, AgentTask } from "@/types";
import { generateId } from "@/lib/utils";
import { createAgentApiClient } from "@/api/agent-client";

// API Agent response type
interface ApiAgent {
  id: string;
  name: string;
  description: string;
  picture?: string;
  template_id: string;
  weekly_spending_limit: number;
  autonomous?: boolean | null;
  created_at: string;
  updated_at: string;
}

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  isLoading: boolean;
  templates: Template[];
  tasks: Record<string, AgentTask[]>; // agentId -> tasks
}

interface AgentActions {
  fetchAgents: (token?: string) => Promise<void>;
  createAgent: (name: string, template: AgentTemplate, description?: string) => Promise<Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  setSelectedAgent: (id: string | null) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => Promise<void>;
  // Template actions
  fetchTemplates: (token?: string) => Promise<Template[]>;
  createAgentFromTemplate: (
    templateId: string,
    data: {
      name: string;
      description: string;
      weekly_spending_limit: number;
      extra_prompt: string;
    },
    token?: string
  ) => Promise<Agent>;
  // Task actions
  fetchAgentTasks: (agentId: string, token?: string) => Promise<AgentTask[]>;
  createAgentTask: (
    agentId: string,
    data: {
      name: string;
      prompt: string;
      cron_schedule: string;
    },
    token?: string
  ) => Promise<AgentTask>;
  updateAgentTask: (
    agentId: string,
    taskId: string,
    data: Partial<AgentTask>,
    token?: string
  ) => Promise<void>;
  deleteAgentTask: (agentId: string, taskId: string, token?: string) => Promise<void>;
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
  food_delivery: {
    description: "Orders food delivery from your favorite restaurants using natural language",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 100,
      requireApprovalAbove: 30,
      allowedCategories: ["food", "restaurant", "delivery"],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 80,
      weeklyLimit: 300,
      monthlyLimit: 800,
      perMerchantLimit: 60,
      spent: { daily: 0, weekly: 0, monthly: 0 },
    },
  },
  travel_booker: {
    description: "Books flights and travel arrangements with calendar integration",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 2000,
      requireApprovalAbove: 200,
      allowedCategories: ["travel", "flights", "hotels"],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 500,
      weeklyLimit: 2000,
      monthlyLimit: 5000,
      perMerchantLimit: 2000,
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
  {
    id: "agent_2",
    name: "Food Runner",
    description: "Orders food delivery from your favorite restaurants using natural language",
    template: "food_delivery",
    status: "active",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 100,
      requireApprovalAbove: 30,
      allowedCategories: ["food", "restaurant", "delivery"],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 80,
      weeklyLimit: 300,
      monthlyLimit: 800,
      perMerchantLimit: 60,
      spent: { daily: 22.50, weekly: 45.00, monthly: 120.00 },
    },
    allowedMerchants: ["doordash.com", "ubereats.com", "grubhub.com"],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActiveAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "agent_3",
    name: "Travel Buddy",
    description: "Books flights and travel arrangements with calendar integration",
    template: "travel_booker",
    status: "active",
    permissions: {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 2000,
      requireApprovalAbove: 200,
      allowedCategories: ["travel", "flights", "hotels"],
      blockedMerchants: [],
    },
    budget: {
      dailyLimit: 500,
      weeklyLimit: 2000,
      monthlyLimit: 5000,
      perMerchantLimit: 2000,
      spent: { daily: 0, weekly: 350.00, monthly: 850.00 },
    },
    allowedMerchants: ["expedia.com", "kayak.com", "google.com/flights"],
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Transform API agent to our Agent type
function transformApiAgentToAgent(apiAgent: ApiAgent): Agent {
  // Map template_id to template
  const templateMap: Record<string, AgentTemplate> = {
    amazon: "deal_hunter",
    // Add more mappings as needed
  };
  
  const template = templateMap[apiAgent.template_id] || "custom";
  
  // Get default values for the template
  const defaults = templateDefaults[template];
  
  return {
    id: apiAgent.id,
    name: apiAgent.name,
    description: apiAgent.description,
    template: template as AgentTemplate,
    status: "active" as AgentStatus, // Default to active
    avatar: apiAgent.picture || undefined,
    permissions: defaults?.permissions || {
      canReadPages: true,
      canCheckout: true,
      maxTransactionAmount: 100,
      requireApprovalAbove: 0,
      allowedCategories: [],
      blockedMerchants: [],
    },
    budget: {
      ...defaults?.budget,
      weeklyLimit: apiAgent.weekly_spending_limit,
      spent: { daily: 0, weekly: 0, monthly: 0 }, // Default to 0
    } as Agent["budget"],
    allowedMerchants: [],
    createdAt: apiAgent.created_at,
    updatedAt: apiAgent.updated_at,
  };
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state
  agents: [],
  selectedAgentId: null,
  isLoading: false,
  templates: [],
  tasks: {},

  // Actions
  fetchAgents: async (token?: string) => {
    set({ isLoading: true });

    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      const response = await apiClient.getAgents({ is_archived: "false" });
      
      console.log("[AgentStore] Agents fetched, response:", response);
      
      // Transform API agents to our Agent type
      const apiAgents = (response.data || []) as ApiAgent[];
      const transformedAgents = apiAgents.map(transformApiAgentToAgent);
      
      set({
        agents: transformedAgents,
        isLoading: false,
      });
    } catch (error) {
      console.error("[AgentStore] Failed to fetch agents:", error);
      // Fallback to mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({
        agents: mockAgents,
        isLoading: false,
      });
    }
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

  // Template actions
  fetchTemplates: async (token?: string) => {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      const response = await apiClient.getTemplates();
      
      console.log("[AgentStore] Templates fetched");
      const templates = response as unknown as Template[];
      set({ templates });
      return templates;
    } catch (error) {
      console.error("[AgentStore] Failed to fetch templates:", error);
      return [];
    }
  },

  createAgentFromTemplate: async (templateId, data, token?: string) => {
    set({ isLoading: true });

    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      const response = await apiClient.useTemplate(templateId, {
        name: data.name,
        picture: "", // Default empty
        description: data.description,
        weekly_spending_limit: data.weekly_spending_limit,
        extra_prompt: data.extra_prompt,
      });

      console.log("[AgentStore] Agent created from template, response:", response);
      
      // Transform API agent to our Agent type
      const apiAgent = (response?.data || response) as ApiAgent;
      const newAgent = transformApiAgentToAgent(apiAgent);
      
      // Auto-create default task (every 3 minutes)
      try {
        await get().createAgentTask(newAgent.id, {
          name: "Default Task",
          prompt: data.extra_prompt || "Check for opportunities",
          cron_schedule: "*/3 * * * *", // Every 3 minutes
        }, token);
        console.log("[AgentStore] Default task created");
      } catch (taskError) {
        console.error("[AgentStore] Failed to create default task:", taskError);
      }

      const { agents } = get();
      set({
        agents: [...agents, newAgent],
        isLoading: false,
      });

      return newAgent;
    } catch (error) {
      console.error("[AgentStore] Failed to create agent from template:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Task actions
  fetchAgentTasks: async (agentId: string, token?: string) => {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      const response = await apiClient.getAgentTasks(agentId);
      
      const tasks = response.data as AgentTask[];
      set((state) => ({
        tasks: { ...state.tasks, [agentId]: tasks },
      }));
      
      console.log(`[AgentStore] Tasks fetched for agent ${agentId}`);
      return tasks;
    } catch (error) {
      console.error(`[AgentStore] Failed to fetch tasks for agent ${agentId}:`, error);
      return [];
    }
  },

  createAgentTask: async (agentId, data, token?: string) => {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      const response = await apiClient.createAgentTask(agentId, data);
      
      // Ensure task has all required fields with defaults
      const taskData = response.data as Partial<AgentTask>;
      const newTask: AgentTask = {
        id: taskData.id || `task_${generateId()}`,
        agent_id: taskData.agent_id || agentId,
        name: taskData.name || data.name,
        prompt: taskData.prompt || data.prompt,
        cron_schedule: taskData.cron_schedule || data.cron_schedule,
        status: taskData.status || "active",
        created_at: taskData.created_at || new Date().toISOString(),
        updated_at: taskData.updated_at || new Date().toISOString(),
      };
      
      // Update tasks in store
      const currentTasks = get().tasks[agentId] || [];
      set((state) => ({
        tasks: { ...state.tasks, [agentId]: [...currentTasks, newTask] },
      }));
      
      console.log(`[AgentStore] Task created for agent ${agentId}`);
      return newTask;
    } catch (error) {
      console.error(`[AgentStore] Failed to create task for agent ${agentId}:`, error);
      throw error;
    }
  },

  updateAgentTask: async (agentId, taskId, data, token?: string) => {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      await apiClient.updateAgentTask(agentId, taskId, data);
      
      // Update task in store
      const currentTasks = get().tasks[agentId] || [];
      const updatedTasks = currentTasks.map((task) =>
        task.id === taskId ? { ...task, ...data } : task
      );
      
      set((state) => ({
        tasks: { ...state.tasks, [agentId]: updatedTasks },
      }));
      
      console.log(`[AgentStore] Task ${taskId} updated`);
    } catch (error) {
      console.error(`[AgentStore] Failed to update task ${taskId}:`, error);
      throw error;
    }
  },

  deleteAgentTask: async (agentId, taskId, token?: string) => {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      await apiClient.deleteAgentTask(agentId, taskId);
      
      // Remove task from store
      const currentTasks = get().tasks[agentId] || [];
      const updatedTasks = currentTasks.filter((task) => task.id !== taskId);
      
      set((state) => ({
        tasks: { ...state.tasks, [agentId]: updatedTasks },
      }));
      
      console.log(`[AgentStore] Task ${taskId} deleted`);
    } catch (error) {
      console.error(`[AgentStore] Failed to delete task ${taskId}:`, error);
      throw error;
    }
  },
}));

