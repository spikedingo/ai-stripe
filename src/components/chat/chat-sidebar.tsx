"use client";

import * as React from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  MoreVertical,
  Bot,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useChatStore, useAgentStore } from "@/stores";
import type { ChatThread, Agent, ApiChatThread } from "@/types";
import { useDeleteChatThread, useGetChatThreads } from "@/services/chat-api";
import { usePrivy } from "@privy-io/react-auth";

interface ChatSidebarProps {
  className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const {
    currentThreadId,
    currentAgentId,
    createThread,
    selectThread,
    deleteThread,
    setCurrentAgent,
    clearCurrentChat,
  } = useChatStore();
  const { agents } = useAgentStore();
  const { authenticated } = usePrivy();
  const deleteThreadMutation = useDeleteChatThread();

  // Get threads from API
  const { data: apiThreads, isLoading: threadsLoading } = useGetChatThreads(
    currentAgentId,
    !!currentAgentId && authenticated
  );

  const [showAgentSelector, setShowAgentSelector] = React.useState(false);
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

  // Get current agent
  const currentAgent = agents.find((a) => a.id === currentAgentId) || agents[0];

  // Get NEW_CHAT thread from store if exists
  const newChatThread = React.useMemo(() => {
    const storeThreads = useChatStore.getState().threads;
    return storeThreads.find(
      (t) => t.id === "NEW_CHAT" && t.agentId === currentAgentId
    );
  }, [currentAgentId]);

  // Transform API threads to ChatThread format for display
  const agentThreads = React.useMemo(() => {
    const threads: ChatThread[] = [];
    
    // Add NEW_CHAT thread if it exists and matches current agent
    if (newChatThread && newChatThread.agentId === currentAgentId) {
      threads.push(newChatThread);
    }
    
    // Add API threads
    if (apiThreads && currentAgentId) {
      const apiThreadsList = apiThreads
        .filter((t: ApiChatThread) => t.agent_id === currentAgentId)
        .map((apiThread: ApiChatThread) => ({
          id: apiThread.id,
          title: apiThread.summary || "New Chat",
          agentId: apiThread.agent_id,
          agentName: currentAgent?.name || "Agent",
          messages: [],
          createdAt: apiThread.created_at,
          updatedAt: apiThread.updated_at || apiThread.created_at,
        })) as ChatThread[];
      
      threads.push(...apiThreadsList);
    }
    
    // Sort by updated_at (most recent first), but NEW_CHAT should be first
    return threads.sort((a, b) => {
      if (a.id === "NEW_CHAT") return -1;
      if (b.id === "NEW_CHAT") return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [apiThreads, currentAgentId, currentAgent, newChatThread]);

  // Group threads by date
  const groupedThreads = React.useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: { label: string; threads: ChatThread[] }[] = [
      { label: "Today", threads: [] },
      { label: "Yesterday", threads: [] },
      { label: "Previous 7 Days", threads: [] },
      { label: "Older", threads: [] },
    ];

    agentThreads.forEach((thread) => {
      const date = new Date(thread.updatedAt);
      if (date.toDateString() === today.toDateString()) {
        groups[0].threads.push(thread);
      } else if (date.toDateString() === yesterday.toDateString()) {
        groups[1].threads.push(thread);
      } else if (date >= lastWeek) {
        groups[2].threads.push(thread);
      } else {
        groups[3].threads.push(thread);
      }
    });

    return groups.filter((g) => g.threads.length > 0);
  }, [agentThreads]);

  const handleNewChat = () => {
    if (!currentAgent) return;
    
    // Check if NEW_CHAT thread already exists
    const storeThreads = useChatStore.getState().threads;
    const existingNewChat = storeThreads.find(
      (t) => t.id === "NEW_CHAT" && t.agentId === currentAgent.id
    );
    
    if (existingNewChat) {
      // If NEW_CHAT exists, just select it
      selectThread("NEW_CHAT");
    } else {
      // Create NEW_CHAT thread
      const newChatThread: ChatThread = {
        id: "NEW_CHAT",
        title: "New Chat",
        agentId: currentAgent.id,
        agentName: currentAgent.name,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to store
      useChatStore.setState((state) => ({
        threads: [newChatThread, ...state.threads],
        currentThreadId: "NEW_CHAT",
        currentAgentId: currentAgent.id,
      }));
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setCurrentAgent(agent.id);
    clearCurrentChat();
    setShowAgentSelector(false);
  };

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Handle NEW_CHAT deletion (just remove from store, no API call)
    if (threadId === "NEW_CHAT") {
      deleteThread(threadId);
      // Select first available thread or clear
      const remainingThreads = agentThreads.filter((t) => t.id !== "NEW_CHAT");
      if (remainingThreads.length > 0) {
        selectThread(remainingThreads[0].id);
      } else {
        clearCurrentChat();
      }
      setMenuOpenId(null);
      return;
    }
    
    if (!currentAgentId || !authenticated) {
      console.error("[ChatSidebar] Cannot delete thread: missing agent ID or not authenticated");
      return;
    }

    try {
      // Call API to delete thread
      await deleteThreadMutation.mutateAsync({
        agentId: currentAgentId,
        chatId: threadId,
      });
      
      // Remove from local store
      deleteThread(threadId);
    } catch (error) {
      console.error("[ChatSidebar] Failed to delete thread:", error);
      // Still remove from local store on error (optimistic update)
      deleteThread(threadId);
    }
    
    setMenuOpenId(null);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-bg-secondary border-l border-border-subtle",
        className
      )}
    >
      {/* Agent Selector */}
      <div className="p-3 border-b border-border-subtle">
        <div className="relative">
          <button
            onClick={() => setShowAgentSelector(!showAgentSelector)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <Avatar
              fallback={currentAgent?.name?.[0] || "A"}
              size="sm"
              className="bg-accent-primary/10 text-accent-primary"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {currentAgent?.name || "Select Agent"}
              </p>
              <p className="text-xs text-text-tertiary truncate">
                {currentAgent?.template?.replace("_", " ") || "No agent selected"}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-text-tertiary transition-transform",
                showAgentSelector && "rotate-180"
              )}
            />
          </button>

          {/* Agent Dropdown */}
          {showAgentSelector && (
            <div className="absolute left-0 right-0 top-full mt-1 py-1 bg-bg-tertiary border border-border-subtle rounded-lg shadow-lg z-20">
              {agents.length > 0 ? (
                agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-bg-hover transition-colors"
                  >
                    <Avatar
                      fallback={agent.name[0]}
                      size="sm"
                      className="bg-accent-primary/10 text-accent-primary"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {agent.name}
                      </p>
                      <p className="text-xs text-text-tertiary truncate">
                        {agent.template.replace("_", " ")}
                      </p>
                    </div>
                    {currentAgentId === agent.id && (
                      <Check className="h-4 w-4 text-accent-primary" />
                    )}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-text-tertiary">No agents available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          variant="secondary"
          className="w-full justify-start gap-2"
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-2">
        {threadsLoading ? (
          <div className="px-2 py-8 text-center">
            <p className="text-sm text-text-tertiary">Loading threads...</p>
          </div>
        ) : groupedThreads.length > 0 ? (
          groupedThreads.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 py-1 text-xs font-medium text-text-tertiary">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={cn(
                      "group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                      currentThreadId === thread.id
                        ? "bg-bg-active"
                        : "hover:bg-bg-hover"
                    )}
                    onClick={() => selectThread(thread.id)}
                  >
                    <MessageSquare className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                    <span className="flex-1 text-sm text-text-primary truncate">
                      {thread.title}
                    </span>
                    
                    {/* Thread Menu - Don't show for NEW_CHAT */}
                    {thread.id !== "NEW_CHAT" && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === thread.id ? null : thread.id);
                          }}
                          className={cn(
                            "p-1 rounded hover:bg-bg-hover transition-colors",
                            "opacity-0 group-hover:opacity-100",
                            menuOpenId === thread.id && "opacity-100"
                          )}
                        >
                          <MoreVertical className="h-4 w-4 text-text-tertiary" />
                        </button>

                        {menuOpenId === thread.id && (
                          <div className="absolute right-0 top-full mt-1 py-1 w-32 bg-bg-tertiary border border-border-subtle rounded-lg shadow-lg z-10">
                            <button
                              onClick={(e) => handleDeleteThread(thread.id, e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-bg-hover"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="px-2 py-8 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-text-tertiary" />
            <p className="text-sm text-text-tertiary">No conversations yet</p>
            <p className="text-xs text-text-tertiary mt-1">
              Start a new chat to begin
            </p>
          </div>
        )}
      </div>

      {/* Current Agent Info */}
      {currentAgent && (
        <div className="p-3 border-t border-border-subtle">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <Bot className="h-3 w-3" />
            <span>Using {currentAgent.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

