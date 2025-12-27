// =============================================================================
// MOCK DATA FOR PURCHASE FLOW AND THINKING CHAIN DEMOS
// =============================================================================

export interface ThinkingStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "waiting_approval";
  duration?: number; // in milliseconds
  timestamp?: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

export interface PurchaseOrder {
  id: string;
  productName: string;
  productUrl: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  quantity: number;
  merchant: string;
  agentId: string;
  agentName: string;
  status: "pending" | "analyzing" | "monitoring" | "purchasing" | "completed" | "failed";
  createdAt: string;
  thinkingChain: ThinkingStep[];
}

export interface X402PaymentInfo {
  requestId: string;
  endpoint: string;
  amount: number;
  currency: string;
  paymentRequired: boolean;
  paymentSignature?: string;
  txHash?: string;
  status: "pending" | "signed" | "settled" | "failed";
}

// Mock Agents for purchase flows
export const mockAgentsForPurchase = [
  {
    id: "agent_1",
    name: "Deal Hunter",
    description: "Monitors prices and auto-purchases when target price is reached",
    template: "deal_hunter",
    avatar: "🎯",
    status: "active",
    dailyBudget: 100,
    spent: 15.99,
  },
  {
    id: "agent_2",
    name: "Food Runner",
    description: "Orders food from your favorite restaurants",
    template: "food_delivery",
    avatar: "🍜",
    status: "active",
    dailyBudget: 80,
    spent: 22.50,
  },
  {
    id: "agent_3",
    name: "Travel Buddy",
    description: "Books flights and travel arrangements",
    template: "travel_booker",
    avatar: "✈️",
    status: "active",
    dailyBudget: 500,
    spent: 0,
  },
];

// Mock thinking chain for a typical purchase flow
export const mockThinkingChain: ThinkingStep[] = [
  {
    id: "step_1",
    title: "Analyzing Product URL",
    description: "Parsing product information from the provided URL",
    status: "completed",
    duration: 1200,
    timestamp: new Date(Date.now() - 30000).toISOString(),
    details: "Successfully extracted product: Sony WH-1000XM5 Wireless Headphones from Amazon",
    metadata: {
      productId: "B09XS7JWHH",
      merchant: "amazon.com",
    },
  },
  {
    id: "step_2",
    title: "Checking Local Spending Limits",
    description: "Verifying transaction is within agent budget constraints",
    status: "completed",
    duration: 300,
    timestamp: new Date(Date.now() - 28000).toISOString(),
    details: "Budget check passed: $348.00 is within daily limit of $500.00",
    metadata: {
      requestedAmount: 348.0,
      dailyLimit: 500.0,
      dailySpent: 15.99,
      remaining: 484.01,
    },
  },
  {
    id: "step_3",
    title: "Fetching Current Price",
    description: "Using Keepa API to get real-time pricing data",
    status: "completed",
    duration: 2100,
    timestamp: new Date(Date.now() - 25000).toISOString(),
    details: "Current price: $348.00 (Target: $320.00, -8% difference)",
    metadata: {
      currentPrice: 348.0,
      targetPrice: 320.0,
      priceDifference: -8,
      priceHistory: [
        { date: "2024-12-20", price: 379.99 },
        { date: "2024-12-22", price: 359.99 },
        { date: "2024-12-25", price: 348.0 },
      ],
    },
  },
  {
    id: "step_4",
    title: "Requesting Human Approval",
    description: "Purchase amount exceeds auto-approve threshold ($50)",
    status: "waiting_approval",
    duration: 0,
    timestamp: new Date(Date.now() - 22000).toISOString(),
    details: "Waiting for user approval to proceed with $348.00 purchase",
    metadata: {
      requiresApproval: true,
      approvalThreshold: 50.0,
      requestedAmount: 348.0,
    },
  },
  {
    id: "step_5",
    title: "Initiating x402 Payment",
    description: "Sending first x402 call to get payment requirements",
    status: "pending",
    details: "Preparing payment request to merchant API",
    metadata: {
      endpoint: "https://api.merchant.com/checkout",
      method: "POST",
    },
  },
  {
    id: "step_6",
    title: "Signing Payment Transaction",
    description: "Agent wallet signing the payment signature",
    status: "pending",
    details: "Generating PAYMENT-SIGNATURE header for x402 protocol",
  },
  {
    id: "step_7",
    title: "Settlement & Confirmation",
    description: "Completing on-chain settlement and receiving confirmation",
    status: "pending",
    details: "Waiting for blockchain confirmation",
  },
];

// Mock purchase orders
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "order_1",
    productName: "Sony WH-1000XM5 Wireless Headphones",
    productUrl: "https://amazon.com/dp/B09XS7JWHH",
    productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
    currentPrice: 348.0,
    targetPrice: 320.0,
    quantity: 1,
    merchant: "Amazon",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    status: "monitoring",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    thinkingChain: mockThinkingChain,
  },
  {
    id: "order_2",
    productName: "Apple AirPods Pro (2nd Gen)",
    productUrl: "https://amazon.com/dp/B0CHWRXH8B",
    productImage: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=200",
    currentPrice: 189.99,
    targetPrice: 179.99,
    quantity: 1,
    merchant: "Amazon",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    thinkingChain: mockThinkingChain.map((step) => ({ ...step, status: "completed" as const })),
  },
];

// Mock x402 payment flow
export const mockX402Payment: X402PaymentInfo = {
  requestId: "x402_req_abc123",
  endpoint: "https://api.amazon.com/v1/checkout",
  amount: 348.0,
  currency: "USDC",
  paymentRequired: true,
  status: "pending",
};

// Completed x402 payment example
export const mockCompletedX402Payment: X402PaymentInfo = {
  requestId: "x402_req_xyz789",
  endpoint: "https://api.amazon.com/v1/checkout",
  amount: 189.99,
  currency: "USDC",
  paymentRequired: true,
  paymentSignature: "0x1a2b3c4d5e6f...",
  txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  status: "settled",
};

// Product suggestions for command palette
export const mockProductSuggestions = [
  {
    id: "sug_1",
    name: "Sony WH-1000XM5",
    category: "Electronics",
    price: 348.0,
    url: "https://amazon.com/dp/B09XS7JWHH",
  },
  {
    id: "sug_2",
    name: "Apple AirPods Pro",
    category: "Electronics",
    price: 189.99,
    url: "https://amazon.com/dp/B0CHWRXH8B",
  },
  {
    id: "sug_3",
    name: "Nintendo Switch OLED",
    category: "Gaming",
    price: 349.99,
    url: "https://amazon.com/dp/B098RKWHHZ",
  },
  {
    id: "sug_4",
    name: "Kindle Paperwhite",
    category: "Electronics",
    price: 139.99,
    url: "https://amazon.com/dp/B08KTZ8249",
  },
];

// Simulate async thinking chain progress
export function simulateThinkingProgress(
  steps: ThinkingStep[],
  onUpdate: (steps: ThinkingStep[]) => void,
  speed: number = 1
): () => void {
  let currentIndex = 0;
  const updatedSteps = [...steps];
  
  const interval = setInterval(() => {
    if (currentIndex >= steps.length) {
      clearInterval(interval);
      return;
    }
    
    // Update current step to in_progress
    updatedSteps[currentIndex] = {
      ...updatedSteps[currentIndex],
      status: "in_progress",
      timestamp: new Date().toISOString(),
    };
    onUpdate([...updatedSteps]);
    
    // After duration, mark as completed
    setTimeout(() => {
      if (updatedSteps[currentIndex].status !== "waiting_approval") {
        updatedSteps[currentIndex] = {
          ...updatedSteps[currentIndex],
          status: "completed",
        };
        onUpdate([...updatedSteps]);
      }
      currentIndex++;
    }, (updatedSteps[currentIndex].duration || 1000) / speed);
    
  }, 2000 / speed);
  
  return () => clearInterval(interval);
}

// Format duration for display
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

// =============================================================================
// SAAS SUBSCRIPTION MANAGEMENT MOCK DATA
// =============================================================================

export interface SaaSTool {
  id: string;
  name: string;
  logo: string;
  category: "saas" | "api" | "cloud";
  description: string;
  monthlyPrice: number; // per seat
  yearlyPrice: number; // per seat (annual)
  features: string[];
}

// Mock Agents for SaaS subscription management
export const mockAgentsForSaaS = [
  {
    id: "agent_saas_1",
    name: "Procurement Bot",
    description: "Handles all team software purchases and license management",
    avatar: "🤖",
    status: "active" as const,
    monthlyBudget: 5000,
    spent: 1250,
  },
  {
    id: "agent_saas_2",
    name: "IT Manager",
    description: "Manages infrastructure and cloud service subscriptions",
    avatar: "👨‍💻",
    status: "active" as const,
    monthlyBudget: 10000,
    spent: 4200,
  },
  {
    id: "agent_saas_3",
    name: "Design Ops",
    description: "Specialized in design tool procurement and management",
    avatar: "🎨",
    status: "paused" as const,
    monthlyBudget: 2000,
    spent: 0,
  },
];

// Mock SaaS tools with pricing
export const mockSaaSTools: SaaSTool[] = [
  // SaaS category
  {
    id: "tool_figma",
    name: "Figma",
    logo: "🎨",
    category: "saas",
    description: "Collaborative design tool for teams",
    monthlyPrice: 15,
    yearlyPrice: 144, // $12/mo billed annually
    features: ["Unlimited projects", "Team libraries", "Dev mode"],
  },
  {
    id: "tool_notion",
    name: "Notion",
    logo: "📝",
    category: "saas",
    description: "All-in-one workspace for notes, docs, and wikis",
    monthlyPrice: 10,
    yearlyPrice: 96, // $8/mo billed annually
    features: ["Unlimited pages", "Guest access", "Integrations"],
  },
  {
    id: "tool_slack",
    name: "Slack",
    logo: "💬",
    category: "saas",
    description: "Team communication and collaboration platform",
    monthlyPrice: 12.5,
    yearlyPrice: 105, // $8.75/mo billed annually
    features: ["Unlimited messaging", "Huddles", "Workflows"],
  },
  {
    id: "tool_linear",
    name: "Linear",
    logo: "📋",
    category: "saas",
    description: "Issue tracking and project management",
    monthlyPrice: 10,
    yearlyPrice: 96,
    features: ["Cycles", "Roadmaps", "GitHub sync"],
  },
  // API category
  {
    id: "tool_openai",
    name: "OpenAI API",
    logo: "🧠",
    category: "api",
    description: "GPT-4 and other AI models via API",
    monthlyPrice: 50, // base tier
    yearlyPrice: 500,
    features: ["GPT-4 access", "Embeddings", "Fine-tuning"],
  },
  {
    id: "tool_anthropic",
    name: "Anthropic API",
    logo: "🤖",
    category: "api",
    description: "Claude AI models for enterprise",
    monthlyPrice: 60,
    yearlyPrice: 600,
    features: ["Claude 3", "100K context", "Enterprise support"],
  },
  {
    id: "tool_twilio",
    name: "Twilio",
    logo: "📱",
    category: "api",
    description: "Communication APIs for SMS, voice, video",
    monthlyPrice: 25,
    yearlyPrice: 240,
    features: ["SMS/MMS", "Voice calls", "WhatsApp"],
  },
  // Cloud category
  {
    id: "tool_vercel",
    name: "Vercel",
    logo: "▲",
    category: "cloud",
    description: "Frontend cloud platform for deployments",
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: ["Unlimited deploys", "Edge functions", "Analytics"],
  },
  {
    id: "tool_aws",
    name: "AWS",
    logo: "☁️",
    category: "cloud",
    description: "Amazon Web Services cloud infrastructure",
    monthlyPrice: 100,
    yearlyPrice: 1000,
    features: ["EC2", "S3", "Lambda", "RDS"],
  },
  {
    id: "tool_cloudflare",
    name: "Cloudflare",
    logo: "🔶",
    category: "cloud",
    description: "CDN, security, and edge computing",
    monthlyPrice: 25,
    yearlyPrice: 240,
    features: ["CDN", "DDoS protection", "Workers"],
  },
];

// Mock thinking chain for SaaS subscription
export const mockSaaSThinkingChain: ThinkingStep[] = [
  {
    id: "saas_step_1",
    title: "Validating Subscription Request",
    description: "Checking tool availability and pricing",
    status: "pending",
    duration: 800,
  },
  {
    id: "saas_step_2",
    title: "Verifying Budget Limits",
    description: "Ensuring request is within monthly budget",
    status: "pending",
    duration: 500,
  },
  {
    id: "saas_step_3",
    title: "Checking Existing Licenses",
    description: "Verifying no duplicate subscriptions exist",
    status: "pending",
    duration: 600,
  },
  {
    id: "saas_step_4",
    title: "Requesting Approval",
    description: "Amount exceeds auto-approve threshold",
    status: "waiting_approval",
    duration: 0,
  },
  {
    id: "saas_step_5",
    title: "Processing Payment",
    description: "Initiating USDC payment via agent wallet",
    status: "pending",
    duration: 1200,
  },
  {
    id: "saas_step_6",
    title: "Activating Licenses",
    description: "Provisioning seats and sending invites",
    status: "pending",
    duration: 1500,
  },
];

// =============================================================================
// RECURRING PURCHASE MOCK DATA
// =============================================================================

export interface RecurringPlan {
  id: string;
  productName: string;
  platform: string;
  platformIcon: string;
  cycle: "weekly" | "biweekly" | "monthly" | "custom";
  customDays?: number;
  quantity: number;
  budgetPerOrder: number;
  lastOrder: string | null;
  nextOrder: string;
  status: "active" | "paused";
  orderHistory: {
    date: string;
    amount: number;
    status: "completed" | "failed";
  }[];
}

// Mock Agents for recurring purchases
export const mockAgentsForRecurring = [
  {
    id: "agent_home_1",
    name: "Home Essentials Bot",
    description: "Manages recurring orders for household essentials",
    avatar: "🏠",
    status: "active" as const,
    monthlyBudget: 200,
    spent: 67.5,
  },
  {
    id: "agent_home_2",
    name: "Pantry Keeper",
    description: "Stocks up on groceries and pantry items",
    avatar: "🥫",
    status: "active" as const,
    monthlyBudget: 300,
    spent: 125,
  },
  {
    id: "agent_home_3",
    name: "Pet Care Bot",
    description: "Handles pet food and supplies orders",
    avatar: "🐕",
    status: "paused" as const,
    monthlyBudget: 150,
    spent: 0,
  },
];

// Mock recurring plans grouped by agent
export const mockRecurringPlans: Record<string, RecurringPlan[]> = {
  agent_home_1: [
    {
      id: "plan_1",
      productName: "Kleenex Facial Tissue (4-pack)",
      platform: "amazon",
      platformIcon: "📦",
      cycle: "monthly",
      quantity: 2,
      budgetPerOrder: 15,
      lastOrder: "2025-12-01",
      nextOrder: "2025-12-31",
      status: "active",
      orderHistory: [
        { date: "2025-12-01", amount: 14.99, status: "completed" },
        { date: "2025-11-01", amount: 13.99, status: "completed" },
        { date: "2025-10-01", amount: 14.49, status: "completed" },
      ],
    },
    {
      id: "plan_2",
      productName: "Glad Trash Bags 13 Gallon (120ct)",
      platform: "walmart",
      platformIcon: "🏪",
      cycle: "biweekly",
      quantity: 1,
      budgetPerOrder: 18,
      lastOrder: "2025-12-15",
      nextOrder: "2025-12-29",
      status: "active",
      orderHistory: [
        { date: "2025-12-15", amount: 16.99, status: "completed" },
        { date: "2025-12-01", amount: 17.49, status: "completed" },
      ],
    },
    {
      id: "plan_3",
      productName: "Bounty Paper Towels (8 rolls)",
      platform: "target",
      platformIcon: "🎯",
      cycle: "monthly",
      quantity: 1,
      budgetPerOrder: 22,
      lastOrder: "2025-12-05",
      nextOrder: "2026-01-05",
      status: "paused",
      orderHistory: [
        { date: "2025-12-05", amount: 19.99, status: "completed" },
      ],
    },
  ],
  agent_home_2: [
    {
      id: "plan_4",
      productName: "Tide Laundry Detergent Pods (96ct)",
      platform: "amazon",
      platformIcon: "📦",
      cycle: "monthly",
      quantity: 1,
      budgetPerOrder: 28,
      lastOrder: "2025-12-10",
      nextOrder: "2026-01-10",
      status: "active",
      orderHistory: [
        { date: "2025-12-10", amount: 26.99, status: "completed" },
        { date: "2025-11-10", amount: 24.99, status: "completed" },
      ],
    },
    {
      id: "plan_5",
      productName: "Clorox Disinfecting Wipes (3-pack)",
      platform: "costco",
      platformIcon: "🛒",
      cycle: "biweekly",
      quantity: 1,
      budgetPerOrder: 15,
      lastOrder: "2025-12-20",
      nextOrder: "2026-01-03",
      status: "active",
      orderHistory: [
        { date: "2025-12-20", amount: 12.99, status: "completed" },
      ],
    },
  ],
  agent_home_3: [],
};

// Mock thinking chain for recurring purchase execution
export const mockRecurringThinkingChain: ThinkingStep[] = [
  {
    id: "rec_step_1",
    title: "Checking Product Availability",
    description: "Verifying item is in stock on platform",
    status: "pending",
    duration: 600,
  },
  {
    id: "rec_step_2",
    title: "Comparing Prices",
    description: "Checking current price vs budget limit",
    status: "pending",
    duration: 800,
  },
  {
    id: "rec_step_3",
    title: "Validating Budget",
    description: "Ensuring order is within agent budget",
    status: "pending",
    duration: 400,
  },
  {
    id: "rec_step_4",
    title: "Requesting Approval",
    description: "Confirming order before checkout",
    status: "waiting_approval",
    duration: 0,
  },
  {
    id: "rec_step_5",
    title: "Processing Payment",
    description: "Completing checkout with agent wallet",
    status: "pending",
    duration: 1000,
  },
  {
    id: "rec_step_6",
    title: "Order Confirmed",
    description: "Updating order history and next delivery date",
    status: "pending",
    duration: 500,
  },
];

