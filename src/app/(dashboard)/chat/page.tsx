"use client";

import * as React from "react";
import { 
  Bot, 
  Sparkles, 
  ShoppingCart, 
  Target, 
  TrendingDown, 
  Menu, 
  X,
  Utensils,
  Plane,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Header } from "@/components/shared/header";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble, TypingIndicator } from "@/components/chat/message-bubble";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChatStore, useAgentStore } from "@/stores";
import { cn } from "@/lib/utils";
import type { AgentTemplate, ChatThread } from "@/types";
import {
  useSendChat,
  useGetChatThreads,
  useGetChatMessages,
  useCreateChatThread,
} from "@/services/chat-api";
import { usePrivy } from "@privy-io/react-auth";

// Welcome messages by agent template
function getWelcomeMessage(template?: AgentTemplate): string {
  switch (template) {
    case "deal_hunter":
      return "I can monitor prices, find deals, and automatically purchase items for you. Just tell me what you're looking for!";
    case "buyer":
      return "I'll help you purchase items, compare products, and find the best deals. What would you like to buy?";
    case "food_delivery":
      return "I can order food from your favorite restaurants. Tell me what you're craving and I'll handle the rest!";
    case "travel_booker":
      return "I'll help you book flights, plan trips, and find travel deals. Where would you like to go?";
    case "subscriber":
      return "I can manage your subscriptions, find better deals, and track recurring payments. How can I help?";
    default:
      return "I'm your AI assistant. I can help with shopping, food delivery, travel bookings, and more!";
  }
}

// Feature labels by agent template
function getFeatureLabels(template?: AgentTemplate): Array<{ icon: React.ElementType; label: string }> {
  switch (template) {
    case "deal_hunter":
      return [
        { icon: Sparkles, label: "AI-Powered" },
        { icon: Target, label: "Price Tracking" },
        { icon: ShoppingCart, label: "Auto-Checkout" },
      ];
    case "buyer":
      return [
        { icon: Sparkles, label: "AI-Powered" },
        { icon: ShoppingCart, label: "Easy Checkout" },
        { icon: CreditCard, label: "Secure Payment" },
      ];
    case "food_delivery":
      return [
        { icon: Utensils, label: "Quick Order" },
        { icon: Sparkles, label: "Smart Suggestions" },
        { icon: CreditCard, label: "Secure Payment" },
      ];
    case "travel_booker":
      return [
        { icon: Plane, label: "Flight Search" },
        { icon: Calendar, label: "Calendar Sync" },
        { icon: CreditCard, label: "x402 Payments" },
      ];
    case "subscriber":
      return [
        { icon: CreditCard, label: "Track Payments" },
        { icon: Calendar, label: "Renewal Alerts" },
        { icon: TrendingDown, label: "Find Savings" },
      ];
    default:
      return [
        { icon: Sparkles, label: "AI-Powered" },
        { icon: ShoppingCart, label: "Multi-Purpose" },
        { icon: CreditCard, label: "Secure" },
      ];
  }
}

// Suggestions by agent template
const suggestionsByTemplate: Record<AgentTemplate, Array<{
  icon: React.ElementType;
  title: string;
  description: string;
  prompt: string;
}>> = {
  deal_hunter: [
    {
      icon: ShoppingCart,
      title: "Auto-purchase an item",
      description: "Paste a product link and set a target price",
      prompt: "I want to buy https://amazon.com/dp/B09V3KXJPB when the price drops below $50",
    },
    {
      icon: Target,
      title: "Monitor prices",
      description: "Track product prices across multiple stores",
      prompt: "Monitor the price of Sony WH-1000XM5 headphones and alert me when it drops 20%",
    },
    {
      icon: TrendingDown,
      title: "Find the best deal",
      description: "Compare prices across different retailers",
      prompt: "Find me the best deal on a Nintendo Switch OLED",
    },
  ],
  buyer: [
    {
      icon: ShoppingCart,
      title: "Buy something",
      description: "I'll help you purchase any item",
      prompt: "Help me buy the latest iPhone from the Apple Store",
    },
    {
      icon: Target,
      title: "Compare products",
      description: "Find the best option for your needs",
      prompt: "Compare the MacBook Pro 14 vs MacBook Air M3 for software development",
    },
    {
      icon: CreditCard,
      title: "Checkout assistance",
      description: "Complete a purchase with best deals",
      prompt: "Help me complete checkout with any available coupons",
    },
  ],
  food_delivery: [
    {
      icon: Utensils,
      title: "Order my usual",
      description: "Quick reorder from your favorite spots",
      prompt: "Order my usual spicy ramen from my favorite Japanese restaurant",
    },
    {
      icon: Sparkles,
      title: "Surprise me",
      description: "Discover new restaurants and dishes",
      prompt: "I'm hungry, suggest something delicious for dinner under $30",
    },
    {
      icon: Calendar,
      title: "Schedule delivery",
      description: "Plan your meals ahead",
      prompt: "Order lunch for tomorrow at 12:30 PM - something healthy",
    },
  ],
  travel_booker: [
    {
      icon: Plane,
      title: "Book a flight",
      description: "Find and book the best flights",
      prompt: "Book me a flight to Tokyo next week, economy class",
    },
    {
      icon: Calendar,
      title: "Plan a trip",
      description: "Multi-city itinerary planning",
      prompt: "Plan a 5-day trip to Paris with flights and hotels",
    },
    {
      icon: TrendingDown,
      title: "Find flight deals",
      description: "Discover cheap flights to popular destinations",
      prompt: "Find me the cheapest flights to anywhere in Asia this month",
    },
  ],
  subscriber: [
    {
      icon: CreditCard,
      title: "Manage subscriptions",
      description: "View and manage your recurring payments",
      prompt: "Show me all my active subscriptions",
    },
    {
      icon: Target,
      title: "Find alternatives",
      description: "Discover cheaper subscription options",
      prompt: "Find me a cheaper alternative to my current streaming services",
    },
    {
      icon: Calendar,
      title: "Renewal reminder",
      description: "Set up renewal notifications",
      prompt: "Remind me before my Netflix subscription renews",
    },
  ],
  custom: [
    {
      icon: Sparkles,
      title: "Get started",
      description: "Tell me what you'd like to do",
      prompt: "What can you help me with?",
    },
    {
      icon: ShoppingCart,
      title: "Shopping",
      description: "Buy or track products",
      prompt: "Help me find the best deals on electronics",
    },
    {
      icon: CreditCard,
      title: "Payments",
      description: "Manage transactions",
      prompt: "Show me my recent transactions",
    },
  ],
};

export default function ChatPage() {
  const {
    currentThreadId,
    currentAgentId,
    isStreaming,
    isProcessing,
    sendMessage,
    handleApproval,
    getCurrentThread,
    setCurrentAgent,
    createThread,
    addMessage,
    selectThread,
    updateMessage,
  } = useChatStore();
  const { agents, fetchAgents } = useAgentStore();
  const { authenticated, ready, getAccessToken } = usePrivy();

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = React.useState(false);

  // API hooks
  const sendChatMutation = useSendChat();
  const createThreadMutation = useCreateChatThread();
  
  // Fetch agents when authenticated
  React.useEffect(() => {
    if (authenticated && ready) {
      const loadAgents = async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            await fetchAgents(token);
          }
        } catch (error) {
          console.error("[ChatPage] Failed to load agents:", error);
        }
      };
      loadAgents();
    }
  }, [authenticated, ready, getAccessToken, fetchAgents]);
  
  // Get current agent (defined early to avoid initialization order issues)
  const currentAgent = agents.find((a) => a.id === currentAgentId) || agents[0];

  // Get chat threads for current agent
  const { data: chatThreads, isLoading: threadsLoading } = useGetChatThreads(
    currentAgentId,
    !!currentAgentId && authenticated
  );

  // Sync threads from API to store (for backward compatibility)
  // Note: Sidebar now uses API threads directly, but we still sync to store for other uses
  React.useEffect(() => {
    if (chatThreads && chatThreads.length > 0 && currentAgentId) {
      const storeThreads = useChatStore.getState().threads;
      
      chatThreads.forEach((apiThread) => {
        const existingThread = storeThreads.find((t) => t.id === apiThread.id);
        
        if (existingThread) {
          // Update thread title if it changed
          if (existingThread.title !== apiThread.summary) {
            useChatStore.getState().updateThreadTitle(
              apiThread.id,
              apiThread.summary || "New Chat"
            );
          }
        } else {
          // Create thread in store if it doesn't exist
          const newThread: ChatThread = {
            id: apiThread.id,
            title: apiThread.summary || "New Chat",
            agentId: apiThread.agent_id,
            agentName: currentAgent?.name || "Agent",
            messages: [],
            createdAt: apiThread.created_at,
            updatedAt: apiThread.updated_at || apiThread.created_at,
          };
          
          useChatStore.setState((state: any) => ({
            threads: [...state.threads, newThread],
          }));
        }
      });

      // Remove threads from store that no longer exist in API
      const apiThreadIds = new Set(chatThreads.map((t: any) => t.id));
      useChatStore.setState((state: any) => ({
        threads: state.threads.filter(
          (t: ChatThread) => 
            t.agentId !== currentAgentId || apiThreadIds.has(t.id)
        ),
      }));
    }
  }, [chatThreads, currentAgentId, currentAgent]);

  // Auto-select first thread if no thread is selected (but don't auto-select if NEW_CHAT exists)
  React.useEffect(() => {
    if (
      chatThreads &&
      chatThreads.length > 0 &&
      !currentThreadId &&
      currentAgentId
    ) {
      // Check if NEW_CHAT thread exists in store
      const storeThreads = useChatStore.getState().threads;
      const hasNewChat = storeThreads.some(
        (t) => t.id === "NEW_CHAT" && t.agentId === currentAgentId
      );
      
      // Only auto-select if NEW_CHAT doesn't exist
      if (!hasNewChat) {
        const firstThread = chatThreads[0];
        if (firstThread) {
          selectThread(firstThread.id);
        }
      }
    }
  }, [chatThreads, currentThreadId, currentAgentId, selectThread]);

  // Get chat messages for current thread (skip if NEW_CHAT)
  const { data: chatMessagesData, isLoading: messagesLoading } = useGetChatMessages(
    {
      agent_id: currentAgentId || "",
      chat_id: currentThreadId || "",
    },
    !!currentThreadId && 
    currentThreadId !== "NEW_CHAT" && 
    !!currentAgentId && 
    authenticated
  );

  // Get current thread and messages
  const currentThread = getCurrentThread();
  const localMessages = currentThread?.messages || [];
  
  // Merge local messages with API messages
  // Priority: API messages > local messages (for optimistic updates)
  const messages = React.useMemo(() => {
    if (chatMessagesData?.messages && chatMessagesData.messages.length > 0) {
      // Reverse messages array since API returns from newest to oldest
      // but chat UI typically displays from oldest to newest
      const reversedMessages = [...chatMessagesData.messages].reverse();
      
      // Transform API messages to local format
      const apiMessages = reversedMessages
        .filter((msg) => {
          // Filter out messages without content (unless they are skill messages)
          return msg.author_type === "skill" || (msg.message && msg.message.length > 0);
        })
        .map((msg) => {
          // Determine role based on author_type
          // "web" or "user" -> user message
          // "agent" or "skill" -> assistant message
          const role: "user" | "assistant" =
            msg.author_type === "web" || msg.author_type === "user"
              ? "user"
              : "assistant";

          return {
            id: msg.id,
            role,
            content: msg.message || "",
            status: "sent" as const,
            createdAt: msg.created_at,
            metadata: {
              skill_calls: msg.skill_calls,
              attachments: msg.attachments,
              author_type: msg.author_type,
            },
          };
        });

      return apiMessages;
    }

    // Fallback to local messages for optimistic updates
    return localMessages;
  }, [chatMessagesData, localMessages]);

  // Get suggestions based on current agent template
  const suggestions = currentAgent 
    ? suggestionsByTemplate[currentAgent.template] || suggestionsByTemplate.custom
    : suggestionsByTemplate.custom;

  // Set default agent on mount if none selected
  React.useEffect(() => {
    if (mounted && !currentAgentId && agents.length > 0) {
      setCurrentAgent(agents[0].id);
    }
  }, [mounted, currentAgentId, agents, setCurrentAgent]);

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = async (content: string) => {
    if (!currentAgent) return;

    let threadId = currentThreadId;
    let isNewChat = threadId === "NEW_CHAT" || !threadId;
    
    // Create thread if needed (when no threadId or when it's NEW_CHAT)
    if (isNewChat) {
      try {
        setShowMobileSidebar(false);
        const result = await createThreadMutation.mutateAsync(currentAgent.id);
        threadId = result.id;
        
        // Replace NEW_CHAT thread with the real thread in store
        if (currentThreadId === "NEW_CHAT" && threadId) {
          const storeThreads = useChatStore.getState().threads;
          const updatedThreads = storeThreads.map((t) => {
            if (t.id === "NEW_CHAT" && t.agentId === currentAgent.id) {
              return {
                ...t,
                id: threadId,
                createdAt: result.created_at || new Date().toISOString(),
                updatedAt: result.updated_at || result.created_at || new Date().toISOString(),
              } as ChatThread;
            }
            return t;
          });
          
          useChatStore.setState({
            threads: updatedThreads,
            currentThreadId: threadId,
          });
        } else if (threadId) {
          // If no threadId, just select the newly created thread
          selectThread(threadId);
        }
      } catch (error) {
        console.error("[Chat] Failed to create thread:", error);
        return;
      }
    }

    if (!threadId) return;

    // Set loading state
    useChatStore.setState({ isProcessing: true, isStreaming: true });

    // Add user message locally (optimistic update) - mark as sent immediately for instant display
    const userMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user" as const,
      content,
      status: "sent" as const,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);

    try {
      // Send message via API
      const responseMessages = await sendChatMutation.mutateAsync({
        agent_id: currentAgent.id,
        chat_id: threadId,
        message: content,
      });

      // Process API response messages (similar to crestal implementation)
      if (responseMessages && Array.isArray(responseMessages) && responseMessages.length > 0) {
        // Filter valid messages (skill messages or messages with content)
        const validMessages = responseMessages.filter(
          (item: any) =>
            item.author_type === "skill" ||
            (item.message && item.message.length > 0)
        );

        if (validMessages.length > 0) {
          // Check if API returned a user message to replace the temporary one
          const apiUserMessage = validMessages.find(
            (item: any) => item.author_type === "web" || item.author_type === "user"
          );

          // Remove temporary user message only if API returned a user message
          if (apiUserMessage) {
            const currentThread = getCurrentThread();
            if (currentThread) {
              const updatedMessages = currentThread.messages.filter(
                (msg) => msg.id !== userMessage.id
              );
              useChatStore.setState((state: any) => ({
                threads: state.threads.map((t: ChatThread) =>
                  t.id === threadId
                    ? { ...t, messages: updatedMessages }
                    : t
                ),
              }));
            }
          }

          // Process all messages in order
          validMessages.forEach((item: any) => {
            // Determine role based on author_type
            // "web" or "user" -> user message
            // "agent" or "skill" -> assistant message
            const role: "user" | "assistant" =
              item.author_type === "web" || item.author_type === "user"
                ? "user"
                : "assistant";

            addMessage({
              id: item.id,
              role,
              content: item.message || "",
              status: "sent",
              createdAt: item.created_at,
              metadata: {
                skill_calls: item.skill_calls || undefined,
                attachments: item.attachments || undefined,
                author_type: item.author_type,
              },
            });
          });

          // Update thread title from first message if it's a new thread
          const currentThread = getCurrentThread();
          if (currentThread && currentThread.messages.length <= 2) {
            // Generate title from first user message
            const firstUserMessage = currentThread.messages.find(
              (msg) => msg.role === "user"
            );
            if (firstUserMessage) {
              const title = firstUserMessage.content
                .replace(/https?:\/\/[^\s]+/g, "[link]")
                .trim()
                .substring(0, 30);
              if (title && currentThread.title === "New Chat") {
                useChatStore.getState().updateThreadTitle(threadId, title);
                // Also update via API if needed
                // Note: This could be done via useUpdateChatThread hook if needed
              }
            }
          }
        } else {
          // If no valid response, keep the user message (already marked as sent)
          // No need to update status since it's already "sent"
        }
      } else {
        // If no response, keep the user message (already marked as sent)
        // No need to update status since it's already "sent"
      }
    } catch (error) {
      console.error("[Chat] Failed to send message:", error);
      // Update message status to error
      const currentThread = getCurrentThread();
      if (currentThread) {
        const updatedMessages = currentThread.messages.map((msg) =>
          msg.id === userMessage.id
            ? { ...msg, status: "error" as const }
            : msg
        );
        useChatStore.setState((state: any) => ({
          threads: state.threads.map((t: ChatThread) =>
            t.id === threadId
              ? { ...t, messages: updatedMessages }
              : t
          ),
        }));
      }
    } finally {
      // Clear loading state
      useChatStore.setState({ isProcessing: false, isStreaming: false });
    }

    setShowMobileSidebar(false);
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSend(prompt);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with mobile menu toggle */}
        <header className="flex h-14 items-center justify-between border-b border-border-subtle bg-bg-primary px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-text-primary truncate">
              {currentThread?.title || (currentAgent ? `Chat with ${currentAgent.name}` : "AI Shopping Assistant")}
            </h1>
          </div>
          {currentAgent && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">{currentAgent.name}</span>
            </div>
          )}
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="max-w-2xl mx-auto text-center">
                {/* Logo */}
                <div className="mx-auto h-16 w-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-6">
                  <Bot className="h-8 w-8 text-accent-primary" />
                </div>

                <h2 className="text-2xl font-semibold text-text-primary mb-2">
                  {currentAgent ? `Chat with ${currentAgent.name}` : "AI Shopping Assistant"}
                </h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  {getWelcomeMessage(currentAgent?.template)}
                </p>

                {/* Suggestions */}
                <div className="grid gap-3 md:grid-cols-3">
                  {suggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer hover:border-accent-primary transition-colors text-left"
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
                          <suggestion.icon className="h-4 w-4 text-accent-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary text-sm">
                            {suggestion.title}
                          </p>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Features */}
                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-text-tertiary">
                  {getFeatureLabels(currentAgent?.template).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <feature.icon className="h-4 w-4" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Messages List
            <div className="py-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onApprove={(id) => handleApproval(id, true)}
                  onReject={(id) => handleApproval(id, false)}
                />
              ))}

              {/* Typing Indicator */}
              {(isStreaming || sendChatMutation.isPending) && <TypingIndicator />}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border-subtle bg-bg-primary p-4">
          <ChatInput
            onSubmit={handleSend}
            disabled={isProcessing || !currentAgent || sendChatMutation.isPending || createThreadMutation.isPending}
            placeholder={
              currentAgent
                ? `Message ${currentAgent.name}...`
                : "Select an agent to start chatting..."
            }
          />
        </div>
      </div>

      {/* Sidebar - Desktop (Right Side) */}
      <ChatSidebar className="hidden lg:flex w-64 flex-shrink-0" />

      {/* Sidebar - Mobile Overlay (Right Side) */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 animate-slide-in-right">
            <ChatSidebar className="h-full" />
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-3 left-3 p-2 rounded-lg bg-bg-tertiary hover:bg-bg-hover"
            >
              <X className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
