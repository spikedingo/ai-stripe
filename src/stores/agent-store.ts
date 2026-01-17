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
  weekly_spending_limit: string;
  autonomous?: AgentTask[] | null;
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
  deleteAgent: (id: string, token?: string) => Promise<void>;
  setSelectedAgent: (id: string | null) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => Promise<void>;
  // Template actions
  fetchTemplates: (token?: string) => Promise<Template[]>;
  createAgentFromTemplate: (
    templateId: string,
    data: {
      name: string;
      description: string;
      weekly_spending_limit: string;
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
      cron?: string | null;
      enabled?: boolean;
      has_memory?: boolean;
      description?: string | null;
      minutes?: number | null;
    },
    token?: string
  ) => Promise<AgentTask>;
  updateAgentTask: (
    agentId: string,
    taskId: string,
    data: Partial<{
      name: string;
      prompt: string;
      cron: string | null;
      enabled: boolean;
      has_memory: boolean;
      description: string | null;
      minutes: number | null;
    }>,
    token?: string
  ) => Promise<void>;
  deleteAgentTask: (agentId: string, taskId: string, token?: string) => Promise<void>;
  // Wallet actions
  fetchAgentWallet: (agentId: string, token?: string) => Promise<void>;
  depositToAgent: (agentId: string, amount: string, token?: string) => Promise<void>;
  withdrawFromAgent: (agentId: string, amount: string, token?: string) => Promise<void>;
}

type AgentStore = AgentState & AgentActions;

// Transform API agent to our Agent type
function transformApiAgentToAgent(apiAgent: ApiAgent): Agent {
  // Map template_id to template
  const templateMap: Record<string, AgentTemplate> = {
    amazon: "deal_hunter",
    // Add more mappings as needed
  };
  
  // Map template_id to merchant domain
  const templateMerchantMap: Record<string, string> = {
    amazon: "amazon.com",
    // Add more mappings as needed
  };
  
  const template = templateMap[apiAgent.template_id] || "custom";
  
  // Get merchant from template_id, or empty array if no mapping
  const merchant = templateMerchantMap[apiAgent.template_id];
  const allowedMerchants = merchant ? [merchant] : [];
  
  return {
    id: apiAgent.id,
    name: apiAgent.name,
    description: apiAgent.description,
    template: template as AgentTemplate,
    status: "active" as AgentStatus,
    avatar: apiAgent.picture || undefined,
    budget: {
      weeklyLimit: Number(apiAgent.weekly_spending_limit) || 0,
      spent: {
        weekly: 0,
      },
    },
    allowedMerchants,
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
      
      // Extract tasks from autonomous field and store them
      const tasksMap: Record<string, AgentTask[]> = {};
      apiAgents.forEach((apiAgent) => {
        if (apiAgent.autonomous && Array.isArray(apiAgent.autonomous)) {
          tasksMap[apiAgent.id] = apiAgent.autonomous;
        }
      });
      
      set((state) => ({
        agents: transformedAgents,
        tasks: { ...state.tasks, ...tasksMap },
        isLoading: false,
      }));
    } catch (error) {
      console.error("[AgentStore] Failed to fetch agents:", error);
      set({
        agents: [],
        isLoading: false,
      });
      throw error;
    }
  },

  createAgent: async (name: string, template: AgentTemplate, description?: string) => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const now = new Date().toISOString();

    const newAgent: Agent = {
      id: `agent_${generateId()}`,
      name,
      description: description || "",
      template,
      status: "active",
      budget: {
        weeklyLimit: 0,
      },
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

  deleteAgent: async (id: string, token?: string) => {
    set({ isLoading: true });

    try {
      if (!token) {
        throw new Error("Access token is required to delete agent");
      }

      // Call archive API to delete/archive the agent
      const apiClient = createAgentApiClient(token);
      await apiClient.archiveAgent(id);

      // Remove agent from store
      const { agents, selectedAgentId } = get();
      set({
        agents: agents.filter((agent) => agent.id !== id),
        selectedAgentId: selectedAgentId === id ? null : selectedAgentId,
        isLoading: false,
      });
    } catch (error) {
      console.error("[AgentStore] Failed to delete agent:", error);
      set({ isLoading: false });
      throw error;
    }
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
      
      // Auto-create default task (every 30 minutes)
      try {
        await get().createAgentTask(newAgent.id, {
          name: "Default Task",
          prompt: data.extra_prompt || "Check for opportunities",
          cron: "*/30 * * * *", // Every 30 minutes
          enabled: true,
          has_memory: true,
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
      
      // API returns task directly, ensure it matches our type
      const taskData = response.data as Partial<AgentTask>;
      const newTask: AgentTask = {
        id: taskData.id || `task_${generateId()}`,
        name: taskData.name || (data as { name: string }).name,
        prompt: taskData.prompt || (data as { prompt: string }).prompt,
        cron: taskData.cron ?? (data as { cron?: string | null }).cron ?? null,
        description: taskData.description ?? null,
        minutes: taskData.minutes ?? null,
        enabled: taskData.enabled ?? (data as { enabled?: boolean }).enabled ?? true,
        has_memory: taskData.has_memory ?? (data as { has_memory?: boolean }).has_memory ?? true,
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

  fetchAgentWallet: async (agentId, token?: string) => {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      const response = await apiClient.getAgentWallet(agentId);
      
      console.log(`[AgentStore] Wallet fetched for agent ${agentId}:`, response);
      
      // Update agent with wallet info
      const { agents } = get();
      const walletData = response.data as { 
        address: string | null; 
        network_id?: string;
        usdc_balance: string | null;
      };
      
      // Only update if address exists
      if (!walletData.address) {
        console.warn(`[AgentStore] Wallet address is null for agent ${agentId}`);
        return;
      }
      
      const updatedAgents = agents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              wallet: {
                address: walletData.address!,
                balance: walletData.usdc_balance || "0",
                // API returns usdc_balance as formatted string, no conversion needed
                balanceFormatted: walletData.usdc_balance || "0",
              },
            }
          : agent
      );
      
      set({ agents: updatedAgents });
    } catch (error) {
      console.error(`[AgentStore] Failed to fetch wallet for agent ${agentId}:`, error);
      throw error;
    }
  },

  depositToAgent: async (agentId, amount, token?: string) => {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      await apiClient.depositToAgent(agentId, amount);
      
      console.log(`[AgentStore] Deposited ${amount} to agent ${agentId}`);
      
      // Refresh wallet balance after deposit
      await get().fetchAgentWallet(agentId, token);
    } catch (error) {
      console.error(`[AgentStore] Failed to deposit to agent ${agentId}:`, error);
      throw error;
    }
  },

  withdrawFromAgent: async (agentId, amount: string, token?: string) => {
    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      await apiClient.withdrawFromAgent(agentId, amount);
      
      console.log(`[AgentStore] Withdrew ${amount} from agent ${agentId}`);
      
      // Refresh wallet balance after withdraw
      await get().fetchAgentWallet(agentId, token);
    } catch (error) {
      console.error(`[AgentStore] Failed to withdraw from agent ${agentId}:`, error);
      throw error;
    }
  },
}));

