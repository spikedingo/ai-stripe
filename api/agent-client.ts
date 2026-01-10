import axios, { AxiosInstance } from "axios";
import agentAPIs from "./agent-apis.json";

// API client configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://p402.crestal.dev/";

// Create axios instance
const createApiClient = (token?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor for authentication
  client.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error(
        "[AgentAPI] Request failed:",
        error.response?.data || error.message
      );
      return Promise.reject(error);
    }
  );

  return client;
};

// Helper function to replace path parameters
const replacePathParams = (
  path: string,
  params: Record<string, string>
): string => {
  let result = path;
  Object.keys(params).forEach((key) => {
    result = result.replace(`{${key}}`, params[key]);
  });
  return result;
};

// Helper function to build query string
const buildQueryString = (
  params: Record<string, string | undefined>
): string => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]!);
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
};

// Type definitions for API responses
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

// API Client class
export class AgentApiClient {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(token);
  }

  // Update token
  setToken(token: string) {
    this.client = createApiClient(token);
  }

  // Get Agents
  async getAgents(params?: { is_archived?: string }): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find((api) => api.id === "get_agents");
    if (!apiDef) throw new Error("API definition not found: get_agents");

    const queryString = buildQueryString({
      is_archived: params?.is_archived,
    });

    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(
      method,
      `${apiDef.path}${queryString}`
    );
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Get Agent
  async getAgent(agentId: string): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find((api) => api.id === "get_agent");
    if (!apiDef) throw new Error("API definition not found: get_agent");

    const path = replacePathParams(apiDef.path, { agent_id: agentId });
    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(method, path);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Archive Agent
  async archiveAgent(agentId: string): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find((api) => api.id === "archive_agent");
    if (!apiDef) throw new Error("API definition not found: archive_agent");

    const path = replacePathParams(apiDef.path, { agent_id: agentId });
    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(method, path);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Activate Agent
  async activateAgent(agentId: string): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find((api) => api.id === "activate_agent");
    if (!apiDef) throw new Error("API definition not found: activate_agent");

    const path = replacePathParams(apiDef.path, { agent_id: agentId });
    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(method, path);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Get Agent Tasks
  async getAgentTasks(agentId: string): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find((api) => api.id === "get_agent_tasks");
    if (!apiDef) throw new Error("API definition not found: get_agent_tasks");

    const path = replacePathParams(apiDef.path, { agent_id: agentId });
    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(method, path);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Create Agent Task
  async createAgentTask(agentId: string, data?: unknown): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find((api) => api.id === "create_agent_task");
    if (!apiDef) throw new Error("API definition not found: create_agent_task");

    const path = replacePathParams(apiDef.path, { agent_id: agentId });
    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(method, path, data);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Update Agent Task
  async updateAgentTask(
    agentId: string,
    taskId: string,
    data?: unknown
  ): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find((api) => api.id === "update_agent_task");
    if (!apiDef) throw new Error("API definition not found: update_agent_task");

    const path = replacePathParams(apiDef.path, {
      agent_id: agentId,
      task_id: taskId,
    });
    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(method, path, data);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Delete Agent Task
  async deleteAgentTask(agentId: string, taskId: string): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find((api) => api.id === "delete_agent_task");
    if (!apiDef) throw new Error("API definition not found: delete_agent_task");

    const path = replacePathParams(apiDef.path, {
      agent_id: agentId,
      task_id: taskId,
    });
    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(method, path);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async getTemplates(): Promise<ApiResponse> {
    const path = "/templates";
    const method = "get";
    const response = await this.makeRequest(method, path);
    return response.data;
  }

  async useTemplate(
    templateId: string,
    data?: {
      name: string;
      picture: string;
      description: string;
      weekly_spending_limit: number;
      extra_prompt: string;
    }
  ): Promise<ApiResponse> {
    const path = `/templates/${templateId}/use`;
    const method = "post";
    const response = await this.makeRequest(method, path, data);
    return response.data;
  }

  async getTimeline(): Promise<ApiResponse> {
    const path = "/timeline";
    const method = "get";
    const response = await this.makeRequest(method, path);
    return response.data;
  }

  // Helper method to make requests based on HTTP method
  private async makeRequest(method: string, path: string, data?: unknown) {
    switch (method) {
      case "get":
        return await this.client.get(path);
      case "post":
        return await this.client.post(path, data);
      case "put":
        return await this.client.put(path, data);
      case "patch":
        return await this.client.patch(path, data);
      case "delete":
        return await this.client.delete(path);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  // Get Agent Task Log
  async getAgentTaskLog(
    agentId: string,
    taskId: string,
    params?: { limit?: string }
  ): Promise<ApiResponse> {
    const apiDef = agentAPIs.apis.find(
      (api) => api.id === "get_agent_task_log"
    );
    if (!apiDef)
      throw new Error("API definition not found: get_agent_task_log");

    const path = replacePathParams(apiDef.path, {
      agent_id: agentId,
      task_id: taskId,
    });
    const queryString = buildQueryString({
      limit: params?.limit,
    });

    const method = apiDef.method.toLowerCase();
    const response = await this.makeRequest(method, `${path}${queryString}`);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }
}

// Export singleton instance factory
export const createAgentApiClient = (token?: string): AgentApiClient => {
  return new AgentApiClient(token);
};

// Export default instance (token can be set later via setToken)
export const agentApiClient = new AgentApiClient();
