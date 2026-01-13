import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { createAgentApiClient } from "@/api/agent-client";
import type {
  SendChatParams,
  GetChatParams,
  ApiChatThread,
  ApiChatMessage,
  ChatMessagesResponse,
} from "@/types";

// =============================================================================
// CHAT API HOOKS
// =============================================================================

/**
 * Hook to send a chat message
 * Returns an array of messages (may include multiple bot/skill messages)
 */
export function useSendChat() {
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendChatParams) => {
      if (!authenticated) {
        throw new Error("User not authenticated");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }

      const client = createAgentApiClient(token);
      const response = await client.sendChat(
        params.agent_id,
        params.chat_id,
        {
          message: params.message,
          attachments: params.attachments,
        }
      );

      // Invalidate chat messages query to refetch
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", params.agent_id, params.chat_id],
      });

      // Invalidate chat threads to update thread list
      queryClient.invalidateQueries({
        queryKey: ["chatThreads", params.agent_id],
      });

      // Return the response data (should be an array of messages)
      return response.data as ApiChatMessage[];
    },
  });
}

/**
 * Hook to get chat threads for an agent
 */
export function useGetChatThreads(agentId: string | null, enabled = true) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery({
    queryKey: ["chatThreads", agentId],
    queryFn: async () => {
      if (!agentId || !authenticated) {
        throw new Error("Agent ID required or user not authenticated");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }

      const client = createAgentApiClient(token);
      const response = await client.getChatThreads(agentId);

      // Transform API response to match our ChatThread type
      const threads = (response.data as ApiChatThread[]) || [];
      return threads;
    },
    enabled: enabled && !!agentId && authenticated,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get chat messages for a specific thread
 */
export function useGetChatMessages(
  params: GetChatParams,
  enabled = true
) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery({
    queryKey: ["chatMessages", params.agent_id, params.chat_id, params.cursor],
    queryFn: async () => {
      if (!params.agent_id || !params.chat_id || !authenticated) {
        throw new Error("Agent ID and Chat ID required or user not authenticated");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }

      const client = createAgentApiClient(token);
      const response = await client.getChatMessages(
        params.agent_id,
        params.chat_id,
        {
          cursor: params.cursor,
          limit: params.limit?.toString() || "50",
        }
      );

      // Transform API response
      const messagesResponse = response.data as ChatMessagesResponse;
      return {
        messages: messagesResponse.data || [],
        nextCursor: messagesResponse.next_cursor || null,
        hasMore: messagesResponse.has_more || false,
      };
    },
    enabled:
      enabled &&
      !!params.agent_id &&
      !!params.chat_id &&
      authenticated,
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook to create a new chat thread
 */
export function useCreateChatThread() {
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: string) => {
      if (!authenticated) {
        throw new Error("User not authenticated");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }

      const client = createAgentApiClient(token);
      const response = await client.createChatThread(agentId);

      // Invalidate chat threads query to refetch
      queryClient.invalidateQueries({
        queryKey: ["chatThreads", agentId],
      });

      return response.data as ApiChatThread;
    },
  });
}

/**
 * Hook to update a chat thread
 */
export function useUpdateChatThread() {
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      chatId,
      summary,
    }: {
      agentId: string;
      chatId: string;
      summary: string;
    }) => {
      if (!authenticated) {
        throw new Error("User not authenticated");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }

      const client = createAgentApiClient(token);
      const response = await client.updateChatThread(agentId, chatId, {
        summary,
      });

      // Invalidate chat threads query to refetch
      queryClient.invalidateQueries({
        queryKey: ["chatThreads", agentId],
      });

      return response.data;
    },
  });
}

/**
 * Hook to delete a chat thread
 */
export function useDeleteChatThread() {
  const { getAccessToken, authenticated } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      chatId,
    }: {
      agentId: string;
      chatId: string;
    }) => {
      if (!authenticated) {
        throw new Error("User not authenticated");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }

      const client = createAgentApiClient(token);
      const response = await client.deleteChatThread(agentId, chatId);

      // Invalidate chat threads query to refetch
      queryClient.invalidateQueries({
        queryKey: ["chatThreads", agentId],
      });

      return response.data;
    },
  });
}
