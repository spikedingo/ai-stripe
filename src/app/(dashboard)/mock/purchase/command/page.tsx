"use client";

import * as React from "react";
import {
  Command,
  Search,
  Bot,
  ShoppingCart,
  Tag,
  ExternalLink,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mockAgentsForPurchase,
  mockProductSuggestions,
  mockThinkingChain,
  type ThinkingStep,
} from "@/lib/mock-data";

type CommandState = "idle" | "typing" | "parsing" | "selecting_agent" | "confirming" | "executing";

export default function CommandPurchasePage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [state, setState] = React.useState<CommandState>("idle");
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null);
  const [parsedProduct, setParsedProduct] = React.useState<{
    name: string;
    url?: string;
    targetPrice?: number;
  } | null>(null);
  const [executionSteps, setExecutionSteps] = React.useState<ThinkingStep[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut to open command palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        resetState();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const resetState = () => {
    setState("idle");
    setInput("");
    setSelectedAgent(null);
    setParsedProduct(null);
    setExecutionSteps([]);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setState(value.length > 0 ? "typing" : "idle");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    // Simulate parsing
    setState("parsing");
    await new Promise((r) => setTimeout(r, 800));

    // Mock parsed result
    const isUrl = input.includes("http") || input.includes("amazon");
    setParsedProduct({
      name: isUrl ? "Sony WH-1000XM5 Wireless Headphones" : input,
      url: isUrl ? input : undefined,
      targetPrice: 320,
    });
    setState("selecting_agent");
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    setState("confirming");
  };

  const handleConfirm = async () => {
    setState("executing");
    
    // Simulate execution with thinking chain
    const steps = [...mockThinkingChain];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
      steps[i] = { ...steps[i], status: i < 3 ? "completed" : steps[i].status };
      setExecutionSteps([...steps]);
      
      if (steps[i].status === "waiting_approval") {
        break;
      }
    }
  };

  const handleApprove = async () => {
    const steps = [...executionSteps];
    
    // Find and complete the approval step
    const approvalIndex = steps.findIndex((s) => s.status === "waiting_approval");
    if (approvalIndex >= 0) {
      steps[approvalIndex] = { ...steps[approvalIndex], status: "completed" };
      setExecutionSteps([...steps]);
    }
    
    // Continue with remaining steps
    for (let i = approvalIndex + 1; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
      steps[i] = { ...steps[i], status: "completed" };
      setExecutionSteps([...steps]);
    }
  };

  const selectedAgentData = mockAgentsForPurchase.find((a) => a.id === selectedAgent);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <Command className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Command Panel Style
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Quick command input inspired by Linear/Raycast. Press{" "}
            <kbd className="px-2 py-1 rounded bg-bg-tertiary text-xs font-mono">⌘K</kbd>{" "}
            to open the command palette.
          </p>
        </div>

        {/* Trigger Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setIsOpen(true)}
            className="gap-2 px-6 py-6 text-lg"
            size="lg"
          >
            <Command className="h-5 w-5" />
            Open Command Palette
            <kbd className="ml-2 px-2 py-0.5 rounded bg-white/20 text-xs">⌘K</kbd>
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          <Card>
            <CardContent className="pt-6">
              <Search className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Natural Language</h3>
              <p className="text-sm text-text-secondary">
                Type product names, URLs, or describe what you want to buy
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Sparkles className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Smart Parsing</h3>
              <p className="text-sm text-text-secondary">
                AI extracts product details, prices, and purchase conditions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Bot className="h-8 w-8 text-accent-primary mb-3" />
              <h3 className="font-medium text-text-primary mb-1">Agent Selection</h3>
              <p className="text-sm text-text-secondary">
                Choose which agent to handle your purchase request
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false);
              resetState();
            }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl mx-4 animate-fade-in-up">
            <Card className="overflow-hidden shadow-2xl border-border-default">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
                {state === "parsing" ? (
                  <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />
                ) : (
                  <Search className="h-5 w-5 text-text-tertiary" />
                )}
                <form onSubmit={handleSubmit} className="flex-1">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Enter product URL or describe what to buy..."
                    className="border-0 bg-transparent focus:ring-0 px-0 text-base"
                    disabled={state !== "idle" && state !== "typing"}
                  />
                </form>
                <kbd className="px-2 py-1 rounded bg-bg-tertiary text-xs text-text-tertiary">
                  ESC
                </kbd>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Idle State - Show Suggestions */}
                {(state === "idle" || state === "typing") && (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-text-tertiary">
                      {input ? "Search Results" : "Quick Suggestions"}
                    </div>
                    {mockProductSuggestions
                      .filter(
                        (p) =>
                          !input ||
                          p.name.toLowerCase().includes(input.toLowerCase())
                      )
                      .map((product) => (
                        <button
                          key={product.id}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover text-left transition-colors"
                          onClick={() => {
                            setInput(product.url);
                            handleSubmit();
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 text-text-tertiary" />
                          <div className="flex-1">
                            <p className="text-sm text-text-primary">{product.name}</p>
                            <p className="text-xs text-text-tertiary">{product.category}</p>
                          </div>
                          <Badge variant="outline">${product.price}</Badge>
                        </button>
                      ))}
                  </div>
                )}

                {/* Parsing State */}
                {state === "parsing" && (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 text-accent-primary animate-spin mx-auto mb-3" />
                    <p className="text-text-secondary">Analyzing your request...</p>
                  </div>
                )}

                {/* Agent Selection */}
                {state === "selecting_agent" && parsedProduct && (
                  <div className="p-4 space-y-4">
                    {/* Parsed Product */}
                    <div className="p-3 rounded-lg bg-bg-tertiary">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-accent-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{parsedProduct.name}</p>
                          {parsedProduct.url && (
                            <p className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3" />
                              {parsedProduct.url}
                            </p>
                          )}
                          {parsedProduct.targetPrice && (
                            <Badge variant="success" className="mt-2">
                              <Tag className="h-3 w-3 mr-1" />
                              Target: ${parsedProduct.targetPrice}
                            </Badge>
                          )}
                        </div>
                        <Check className="h-5 w-5 text-success" />
                      </div>
                    </div>

                    {/* Agent Selection */}
                    <div>
                      <p className="text-sm font-medium text-text-secondary mb-2">
                        Select an agent to handle this purchase:
                      </p>
                      <div className="space-y-2">
                        {mockAgentsForPurchase.map((agent) => (
                          <button
                            key={agent.id}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                              selectedAgent === agent.id
                                ? "border-accent-primary bg-accent-primary/5"
                                : "border-border-subtle hover:border-border-default hover:bg-bg-hover"
                            )}
                            onClick={() => handleAgentSelect(agent.id)}
                          >
                            <span className="text-2xl">{agent.avatar}</span>
                            <div className="flex-1">
                              <p className="font-medium text-text-primary">{agent.name}</p>
                              <p className="text-xs text-text-tertiary">{agent.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={agent.status === "active" ? "success" : "warning"}>
                                {agent.status}
                              </Badge>
                              <p className="text-xs text-text-tertiary mt-1">
                                ${agent.spent} / ${agent.dailyBudget}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirming State */}
                {state === "confirming" && parsedProduct && selectedAgentData && (
                  <div className="p-4 space-y-4">
                    <div className="p-4 rounded-lg bg-bg-tertiary">
                      <h4 className="font-medium text-text-primary mb-3">Confirm Purchase Request</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Product:</span>
                          <span className="text-text-primary">{parsedProduct.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Target Price:</span>
                          <span className="text-text-primary">${parsedProduct.targetPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Agent:</span>
                          <span className="text-text-primary">
                            {selectedAgentData.avatar} {selectedAgentData.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setState("selecting_agent")}
                      >
                        Back
                      </Button>
                      <Button className="flex-1" onClick={handleConfirm}>
                        Confirm & Start
                      </Button>
                    </div>
                  </div>
                )}

                {/* Executing State */}
                {state === "executing" && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Loader2 className="h-4 w-4 text-accent-primary animate-spin" />
                      <span className="text-sm font-medium text-text-primary">
                        Agent is working...
                      </span>
                    </div>
                    <div className="space-y-2">
                      {executionSteps.map((step) => (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg",
                            step.status === "completed" && "bg-success/5",
                            step.status === "waiting_approval" && "bg-warning/10"
                          )}
                        >
                          {step.status === "completed" && (
                            <Check className="h-4 w-4 text-success" />
                          )}
                          {step.status === "waiting_approval" && (
                            <AlertCircle className="h-4 w-4 text-warning" />
                          )}
                          {step.status === "pending" && (
                            <div className="h-4 w-4 rounded-full border-2 border-border-default" />
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              step.status === "completed"
                                ? "text-text-primary"
                                : "text-text-tertiary"
                            )}
                          >
                            {step.title}
                          </span>
                          {step.status === "waiting_approval" && (
                            <Badge variant="warning" className="ml-auto">
                              Needs Approval
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    {executionSteps.some((s) => s.status === "waiting_approval") && (
                      <div className="flex gap-2 mt-4">
                        <Button variant="secondary" className="flex-1">
                          Reject
                        </Button>
                        <Button className="flex-1" onClick={handleApprove}>Approve</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border-subtle bg-bg-secondary flex items-center justify-between text-xs text-text-tertiary">
                <span>
                  Press <kbd className="px-1.5 py-0.5 rounded bg-bg-tertiary">↵</kbd> to submit
                </span>
                <span>Command Panel Demo</span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

