// =============================================================================
// USER TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// =============================================================================
// BALANCE & TRANSACTION TYPES
// =============================================================================

export interface Balance {
  available: number;
  pending: number;
  currency: "USDC";
}

export type TransactionType = "deposit" | "withdrawal" | "payment" | "refund";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: "USDC";
  status: TransactionStatus;
  description: string;
  agentId?: string;
  merchantName?: string;
  txHash?: string;
  createdAt: string;
}

// =============================================================================
// AGENT TYPES
// =============================================================================

export type AgentStatus = "active" | "paused" | "stopped";
export type AgentTemplate = "deal_hunter" | "buyer" | "subscriber" | "custom";

export interface AgentPermissions {
  canReadPages: boolean;
  canCheckout: boolean;
  maxTransactionAmount: number;
  requireApprovalAbove: number;
  allowedCategories: string[];
  blockedMerchants: string[];
}

export interface AgentBudget {
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  perMerchantLimit: number;
  spent: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  template: AgentTemplate;
  status: AgentStatus;
  avatar?: string;
  permissions: AgentPermissions;
  budget: AgentBudget;
  allowedMerchants: string[];
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

// =============================================================================
// CHAT & MESSAGE TYPES
// =============================================================================

export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "sending" | "sent" | "error";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  toolCalls?: ToolCall[];
  plan?: ExecutionPlan;
  approval?: ApprovalRequest;
  transaction?: Transaction;
}

export interface ChatThread {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// EXECUTION & APPROVAL TYPES
// =============================================================================

export type ExecutionStepStatus = "pending" | "in_progress" | "completed" | "failed" | "awaiting_approval";

export interface ExecutionStep {
  id: string;
  name: string;
  description: string;
  status: ExecutionStepStatus;
  estimatedCost?: number;
  estimatedTime?: string;
  result?: string;
  error?: string;
}

export interface ExecutionPlan {
  id: string;
  title: string;
  description: string;
  steps: ExecutionStep[];
  totalEstimatedCost: number;
  totalEstimatedTime: string;
  status: "draft" | "approved" | "executing" | "completed" | "failed" | "cancelled";
  createdAt: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  planId: string;
  stepId?: string;
  type: "plan" | "transaction" | "sensitive_action";
  title: string;
  description: string;
  amount?: number;
  status: ApprovalStatus;
  expiresAt: string;
  createdAt: string;
}

// =============================================================================
// TOOL CALL TYPES
// =============================================================================

export type ToolCallStatus = "pending" | "executing" | "completed" | "failed";

export interface ToolCall {
  id: string;
  name: string;
  description: string;
  status: ToolCallStatus;
  cost?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

// =============================================================================
// WISHLIST & DEMO A TYPES
// =============================================================================

export type WishlistItemStatus = "monitoring" | "ready_to_buy" | "purchased" | "cancelled";

export interface WishlistItem {
  id: string;
  url: string;
  title: string;
  imageUrl?: string;
  currentPrice: number;
  targetPrice: number;
  maxPrice: number;
  merchant: string;
  status: WishlistItemStatus;
  agentId: string;
  priceHistory: PricePoint[];
  createdAt: string;
  updatedAt: string;
  purchasedAt?: string;
}

export interface PricePoint {
  price: number;
  timestamp: string;
}

// =============================================================================
// ACTIVITY & EVENT TYPES
// =============================================================================

export type ActivityType =
  | "agent_created"
  | "agent_updated"
  | "tool_call"
  | "payment_402"
  | "approval_requested"
  | "approval_granted"
  | "approval_rejected"
  | "transaction_completed"
  | "wishlist_added"
  | "price_alert"
  | "auto_purchase";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  agentId?: string;
  agentName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// =============================================================================
// RECEIPT TYPES
// =============================================================================

export interface PaymentReceipt {
  id: string;
  transactionId: string;
  amount: number;
  currency: "USDC";
  merchant: string;
  merchantConfirmationId?: string;
  txHash: string;
  nonce: string;
  blobHash?: string;
  encryptedOrderDetails?: string;
  verificationUrl: string;
  createdAt: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

