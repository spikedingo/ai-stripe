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
  ChevronRight,
  Globe,
  DollarSign,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

type FlowStep = 
  | "select_product" 
  | "select_website" 
  | "set_price" 
  | "select_agent" 
  | "confirm" 
  | "executing";

interface PurchaseConfig {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
  } | null;
  website: string | null;
  targetPrice: number | null;
  priceCondition: "exact" | "below" | "any";
  agent: string | null;
}

// Mock purchase websites
const purchaseWebsites = [
  { id: "amazon", name: "Amazon", icon: "🛒", description: "Fast delivery, Prime eligible" },
  { id: "bestbuy", name: "Best Buy", icon: "🏪", description: "Price match guarantee" },
  { id: "walmart", name: "Walmart", icon: "🏬", description: "Everyday low prices" },
  { id: "newegg", name: "Newegg", icon: "💻", description: "Tech specialist" },
  { id: "target", name: "Target", icon: "🎯", description: "RedCard 5% off" },
];

// Price condition options
const priceConditions = [
  { id: "below", label: "Buy when price drops below", icon: "📉" },
  { id: "exact", label: "Buy at exact price", icon: "🎯" },
  { id: "any", label: "Buy at any price", icon: "⚡" },
];

export default function CommandPurchasePage() {
  const [flowStep, setFlowStep] = React.useState<FlowStep>("select_product");
  const [searchInput, setSearchInput] = React.useState("");
  const [config, setConfig] = React.useState<PurchaseConfig>({
    product: null,
    website: null,
    targetPrice: null,
    priceCondition: "below",
    agent: null,
  });
  const [customPriceInput, setCustomPriceInput] = React.useState("");
  const [executionSteps, setExecutionSteps] = React.useState<ThinkingStep[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input on mount
  React.useEffect(() => {
    if (inputRef.current && flowStep === "select_product") {
      inputRef.current.focus();
    }
  }, [flowStep]);

  const resetFlow = () => {
    setFlowStep("select_product");
    setSearchInput("");
    setConfig({
      product: null,
      website: null,
      targetPrice: null,
      priceCondition: "below",
      agent: null,
    });
    setCustomPriceInput("");
    setExecutionSteps([]);
  };

  const handleProductSelect = (product: typeof mockProductSuggestions[0]) => {
    setConfig({ ...config, product, targetPrice: Math.round(product.price * 0.9) });
    setCustomPriceInput(String(Math.round(product.price * 0.9)));
    setFlowStep("select_website");
  };

  const handleWebsiteSelect = (websiteId: string) => {
    setConfig({ ...config, website: websiteId });
    setFlowStep("set_price");
  };

  const handlePriceConfirm = () => {
    const price = customPriceInput ? Number(customPriceInput) : config.targetPrice;
    setConfig({ ...config, targetPrice: price });
    setFlowStep("select_agent");
  };

  const handleAgentSelect = (agentId: string) => {
    setConfig({ ...config, agent: agentId });
    setFlowStep("confirm");
  };

  const handleConfirm = async () => {
    setFlowStep("executing");
    
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

  const selectedWebsite = purchaseWebsites.find((w) => w.id === config.website);
  const selectedAgent = mockAgentsForPurchase.find((a) => a.id === config.agent);

  const filteredProducts = mockProductSuggestions.filter(
    (p) => !searchInput || p.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Progress indicator
  const steps = ["Product", "Website", "Price", "Agent", "Confirm"];
  const currentStepIndex = {
    select_product: 0,
    select_website: 1,
    set_price: 2,
    select_agent: 3,
    confirm: 4,
    executing: 5,
  }[flowStep];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/10 mb-4">
            <Command className="h-6 w-6 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Quick Purchase Flow
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Select a product and follow the guided steps to set up your purchase agent.
          </p>
        </div>

        {/* Progress Bar */}
        {flowStep !== "executing" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={cn(
                    "flex items-center justify-center h-8 px-3 rounded-full text-xs font-medium transition-colors",
                    index < currentStepIndex
                      ? "bg-accent-primary text-white"
                      : index === currentStepIndex
                      ? "bg-accent-primary/20 text-accent-primary border border-accent-primary"
                      : "bg-bg-tertiary text-text-tertiary"
                  )}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  <span className="ml-1.5 hidden sm:inline">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-text-tertiary" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Main Content Card */}
        <Card className="overflow-hidden">
          {/* Step 1: Select Product */}
          {flowStep === "select_product" && (
            <div className="p-0">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border-subtle bg-bg-secondary">
                <Search className="h-5 w-5 text-text-tertiary" />
                <Input
                  ref={inputRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for a product..."
                  className="border-0 bg-transparent focus:ring-0 px-0 text-base"
                />
              </div>

              {/* Product List */}
              <div className="p-2 max-h-[400px] overflow-y-auto">
                <div className="px-3 py-2 text-xs font-medium text-text-tertiary">
                  {searchInput ? "Search Results" : "Popular Products"}
                </div>
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-bg-hover text-left transition-colors group"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-bg-tertiary flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-text-tertiary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-text-tertiary">{product.category}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      ${product.price}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Website */}
          {flowStep === "select_website" && config.product && (
            <div className="p-4 space-y-4">
              {/* Selected Product Summary */}
              <div className="p-3 rounded-lg bg-bg-tertiary flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-accent-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{config.product.name}</p>
                  <p className="text-xs text-text-tertiary">{config.product.category}</p>
                </div>
                <Badge variant="success">
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              </div>

              {/* Question */}
              <div className="flex items-start gap-3 pt-2">
                <div className="h-8 w-8 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="h-4 w-4 text-accent-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Where would you like to purchase?</h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Select a website for the agent to monitor and purchase from
                  </p>
                </div>
              </div>

              {/* Website Options */}
              <div className="grid gap-2">
                {purchaseWebsites.map((website) => (
                  <button
                    key={website.id}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group hover:shadow-sm",
                      config.website === website.id
                        ? "border-accent-primary bg-accent-primary/5"
                        : "border-border-subtle hover:border-accent-primary/50 hover:bg-bg-hover"
                    )}
                    onClick={() => handleWebsiteSelect(website.id)}
                  >
                    <span className="text-2xl">{website.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{website.name}</p>
                      <p className="text-xs text-text-tertiary">{website.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Set Price */}
          {flowStep === "set_price" && config.product && (
            <div className="p-4 space-y-4">
              {/* Summary */}
              <div className="p-3 rounded-lg bg-bg-tertiary space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="h-4 w-4 text-text-tertiary" />
                  <span className="text-text-secondary">Product:</span>
                  <span className="text-text-primary font-medium">{config.product.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-text-tertiary" />
                  <span className="text-text-secondary">Website:</span>
                  <span className="text-text-primary font-medium">{selectedWebsite?.name}</span>
                </div>
              </div>

              {/* Question */}
              <div className="flex items-start gap-3 pt-2">
                <div className="h-8 w-8 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-accent-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Set your target price</h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Current price is ${config.product.price}. We suggest ${config.targetPrice} (10% off).
                  </p>
                </div>
              </div>

              {/* Price Condition Options */}
              <div className="grid gap-2">
                {priceConditions.map((condition) => (
                  <button
                    key={condition.id}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      config.priceCondition === condition.id
                        ? "border-accent-primary bg-accent-primary/5"
                        : "border-border-subtle hover:border-accent-primary/50 hover:bg-bg-hover"
                    )}
                    onClick={() => setConfig({ ...config, priceCondition: condition.id as "exact" | "below" | "any" })}
                  >
                    <span className="text-xl">{condition.icon}</span>
                    <span className="font-medium text-text-primary">{condition.label}</span>
                    {config.priceCondition === condition.id && (
                      <Check className="h-4 w-4 text-accent-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              {/* Price Input */}
              {config.priceCondition !== "any" && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle">
                  <span className="text-xl">💰</span>
                  <div className="flex-1">
                    <label className="text-xs text-text-tertiary">Target Price (USD)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-text-secondary">$</span>
                      <Input
                        type="number"
                        value={customPriceInput}
                        onChange={(e) => setCustomPriceInput(e.target.value)}
                        className="border-0 bg-transparent focus:ring-0 px-0 text-lg font-medium"
                        placeholder={String(config.targetPrice)}
                      />
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Save ${config.product.price - (Number(customPriceInput) || config.targetPrice || 0)}
                  </Badge>
                </div>
              )}

              {/* Continue Button */}
              <Button className="w-full" size="lg" onClick={handlePriceConfirm}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 4: Select Agent */}
          {flowStep === "select_agent" && config.product && (
            <div className="p-4 space-y-4">
              {/* Summary */}
              <div className="p-3 rounded-lg bg-bg-tertiary space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="h-4 w-4 text-text-tertiary" />
                  <span className="text-text-secondary">Product:</span>
                  <span className="text-text-primary font-medium">{config.product.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-text-tertiary" />
                  <span className="text-text-secondary">Website:</span>
                  <span className="text-text-primary font-medium">{selectedWebsite?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-text-tertiary" />
                  <span className="text-text-secondary">Target:</span>
                  <span className="text-text-primary font-medium">
                    {config.priceCondition === "any" 
                      ? "Any price" 
                      : `$${config.targetPrice} (${config.priceCondition === "below" ? "or below" : "exact"})`
                    }
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="flex items-start gap-3 pt-2">
                <div className="h-8 w-8 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-accent-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Select an agent</h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Choose which AI agent will handle this purchase task
                  </p>
                </div>
              </div>

              {/* Agent Options */}
              <div className="space-y-2">
                {mockAgentsForPurchase.map((agent) => (
                  <button
                    key={agent.id}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group hover:shadow-sm",
                      config.agent === agent.id
                        ? "border-accent-primary bg-accent-primary/5"
                        : "border-border-subtle hover:border-accent-primary/50 hover:bg-bg-hover"
                    )}
                    onClick={() => handleAgentSelect(agent.id)}
                  >
                    <span className="text-2xl">{agent.avatar}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text-primary">{agent.name}</p>
                        <Badge variant={agent.status === "active" ? "success" : "warning"} className="text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-tertiary">{agent.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-tertiary">
                        Budget: ${agent.dailyBudget}/day
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Spent: ${agent.spent}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {flowStep === "confirm" && config.product && selectedAgent && (
            <div className="p-4 space-y-4">
              {/* Full Summary */}
              <div className="p-4 rounded-lg bg-bg-tertiary space-y-3">
                <h4 className="font-medium text-text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-primary" />
                  Purchase Task Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-text-secondary flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Product
                    </span>
                    <span className="text-text-primary font-medium">{config.product.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-text-secondary flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </span>
                    <span className="text-text-primary font-medium">
                      {selectedWebsite?.icon} {selectedWebsite?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-text-secondary flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Target Price
                    </span>
                    <span className="text-text-primary font-medium">
                      {config.priceCondition === "any" 
                        ? "Any price" 
                        : `$${config.targetPrice} (${config.priceCondition === "below" ? "or below" : "exact"})`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border-subtle">
                    <span className="text-text-secondary flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Agent
                    </span>
                    <span className="text-text-primary font-medium">
                      {selectedAgent.avatar} {selectedAgent.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-text-secondary flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration
                    </span>
                    <span className="text-text-primary font-medium">
                      Until purchase or 30 days
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setFlowStep("select_agent")}
                >
                  Back
                </Button>
                <Button className="flex-1" onClick={handleConfirm}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Purchase Task
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Executing */}
          {flowStep === "executing" && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="h-4 w-4 text-accent-primary animate-spin" />
                <span className="text-sm font-medium text-text-primary">
                  Agent is working on your task...
                </span>
              </div>
              <div className="space-y-2">
                {executionSteps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      step.status === "completed" && "bg-success/5",
                      step.status === "waiting_approval" && "bg-warning/10"
                    )}
                  >
                    {step.status === "completed" && (
                      <Check className="h-4 w-4 text-success shrink-0" />
                    )}
                    {step.status === "waiting_approval" && (
                      <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                    )}
                    {step.status === "pending" && (
                      <div className="h-4 w-4 rounded-full border-2 border-border-default shrink-0" />
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
                  <Button className="flex-1" onClick={handleApprove}>
                    Approve Purchase
                  </Button>
                </div>
              )}
              {executionSteps.length > 0 && executionSteps.every((s) => s.status === "completed") && (
                <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Purchase task completed!</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Your order has been placed successfully.
                  </p>
                  <Button className="mt-3" onClick={resetFlow}>
                    Start New Purchase
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Reset Button (when not at start) */}
        {flowStep !== "select_product" && flowStep !== "executing" && (
          <div className="text-center">
            <Button variant="ghost" onClick={resetFlow}>
              Start Over
            </Button>
          </div>
        )}

        {/* Features Info */}
        {flowStep === "select_product" && (
          <div className="grid gap-4 md:grid-cols-3 mt-8">
            <Card>
              <CardContent className="pt-6">
                <Search className="h-8 w-8 text-accent-primary mb-3" />
                <h3 className="font-medium text-text-primary mb-1">Quick Selection</h3>
                <p className="text-sm text-text-secondary">
                  Choose from popular products or search for what you need
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Sparkles className="h-8 w-8 text-accent-primary mb-3" />
                <h3 className="font-medium text-text-primary mb-1">Guided Setup</h3>
                <p className="text-sm text-text-secondary">
                  Step-by-step configuration with smart defaults
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Bot className="h-8 w-8 text-accent-primary mb-3" />
                <h3 className="font-medium text-text-primary mb-1">Agent Execution</h3>
                <p className="text-sm text-text-secondary">
                  AI agents monitor and complete your purchase automatically
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
