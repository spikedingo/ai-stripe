"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Sparkles, ShoppingCart, Target, TrendingDown } from "lucide-react";
import { Header } from "@/components/shared/header";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble, TypingIndicator } from "@/components/chat/message-bubble";
import { Card } from "@/components/ui/card";
import { useChatStore, useAgentStore } from "@/stores";

const suggestions = [
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
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agent");

  const { messages, isStreaming, isProcessing, sendMessage, handleApproval, clearChat } =
    useChatStore();
  const { agents } = useAgentStore();

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  const selectedAgent = agentId ? agents.find((a) => a.id === agentId) : agents[0];

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSend(prompt);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header
        title={selectedAgent ? `Chat with ${selectedAgent.name}` : "AI Shopping Assistant"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
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
                  AI Shopping Assistant
                </h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  I can monitor prices, find deals, and automatically purchase items for you.
                  Just tell me what you&apos;re looking for!
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
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Price Tracking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Auto-Checkout</span>
                  </div>
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
              {isStreaming && <TypingIndicator />}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border-subtle bg-bg-primary p-4">
          <ChatInput
            onSubmit={handleSend}
            disabled={isProcessing}
            placeholder={
              selectedAgent
                ? `Message ${selectedAgent.name}...`
                : "Paste a product link or describe what you want..."
            }
          />
        </div>
      </div>
    </>
  );
}

