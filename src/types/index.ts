// =============================================================================
// USER TYPES
// =============================================================================

export interface WalletInfo {
  address: string;
  chainId: number;
  chainType: "ethereum" | "solana";
  walletClientType: "privy" | "metamask" | "coinbase_wallet" | "other";
  isEmbedded: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  wallet?: WalletInfo;
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
export type AgentTemplate = "deal_hunter" | "buyer" | "subscriber" | "food_delivery" | "travel_booker" | "custom";

// Template types from API
export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt_structure: string;
  default_settings: {
    weekly_spending_limit: number;
    check_frequency: string; // cron expression
  };
}

// Task types from API
export interface AgentTask {
  id: string;
  name: string;
  description: string | null;
  minutes: number | null;
  cron: string | null;
  prompt: string;
  enabled: boolean;
  has_memory: boolean;
}

// Timeline event type from API
export interface TimelineEvent {
  id: string;
  agent_id: string;
  text: string;
  images: string[] | null;
  video: string | null;
  post_id: string | null;
  created_at: string;
}

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

export interface AgentWallet {
  address: string;
  balance: string; // Balance in wei or token amount
  balanceFormatted?: string; // Human-readable balance
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
  wallet?: AgentWallet;
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
  foodOrder?: FoodOrder;
  flightBooking?: FlightBooking;
  skill_calls?: unknown[] | null;
  attachments?: ChatMessageAttachment[] | null;
  author_type?: string;
  [key: string]: unknown;
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
// CHAT API TYPES
// =============================================================================

export interface SendChatParams {
  agent_id: string;
  chat_id: string;
  message: string;
  attachments?: ChatMessageAttachment[];
}

export interface GetChatParams {
  agent_id: string;
  chat_id?: string;
  cursor?: string;
  limit?: number;
}

export interface ChatMessageAttachment {
  type: string;
  url: string;
}

export interface ApiChatThread {
  id: string;
  agent_id: string;
  user_id: string;
  summary: string;
  rounds?: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiChatMessage {
  id: string;
  agent_id: string;
  chat_id: string;
  user_id: string;
  author_id: string;
  author_type: "web" | "user" | "agent" | "system" | "skill";
  model?: string | null;
  thread_type?: string;
  reply_to?: string | null;
  message: string;
  attachments?: ChatMessageAttachment[] | null;
  skill_calls?: unknown[] | null;
  input_tokens?: number;
  output_tokens?: number;
  time_cost?: number;
  credit_event_id?: string | null;
  credit_cost?: number | null;
  cold_start_cost?: number;
  app_id?: string | null;
  search_mode?: string | null;
  super_mode?: string | null;
  error_type?: string | null;
  created_at: string;
}

export interface ChatMessagesResponse {
  data: ApiChatMessage[];
  next_cursor?: string | null;
  has_more?: boolean;
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
// DEMO B: FOOD DELIVERY TYPES
// =============================================================================

export type FoodOrderStatus = "searching" | "selecting" | "cart" | "checkout" | "ordered" | "delivered" | "cancelled";
export type ExecutionMethod = "api" | "browser_automation";

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  imageUrl?: string;
  address: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  customizations?: string[];
}

export interface FoodOrder {
  id: string;
  restaurant: Restaurant;
  items: FoodItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  estimatedDelivery: string;
  status: FoodOrderStatus;
  executionMethod: ExecutionMethod;
  deliveryAddress?: string;
  specialInstructions?: string;
  createdAt: string;
}

// =============================================================================
// DEMO C: FLIGHT BOOKING TYPES
// =============================================================================

export type FlightBookingStatus = "searching" | "selecting" | "booking" | "confirmed" | "cancelled";

export interface FlightOption {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: number;
  class: "economy" | "business" | "first";
  seatsAvailable: number;
}

export interface FlightBooking {
  id: string;
  outboundFlight?: FlightOption;
  returnFlight?: FlightOption;
  selectedFlightId?: string;
  flightOptions: FlightOption[];
  passengers: number;
  tripType: "one_way" | "round_trip";
  totalPrice: number;
  toolCallsCost: number;
  status: FlightBookingStatus;
  calendarAvailability?: {
    availableDates: string[];
    conflictingEvents: string[];
  };
  bookingReference?: string;
  createdAt: string;
}

// =============================================================================
// EXECUTION STEP EXTENDED TYPES
// =============================================================================

export interface SensitiveStep {
  stepId: string;
  type: "login" | "payment" | "personal_info" | "final_checkout";
  requiresApproval: boolean;
  warningMessage: string;
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
  | "auto_purchase"
  // Demo B: Food Delivery
  | "food_order_started"
  | "food_order_placed"
  | "food_order_delivered"
  | "restaurant_search"
  | "login_required"
  // Demo C: Flight Booking
  | "flight_search"
  | "flight_selected"
  | "flight_booked"
  | "calendar_checked";

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

