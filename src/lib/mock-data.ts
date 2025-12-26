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

