import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { 
  Message, 
  ExecutionPlan, 
  ApprovalRequest, 
  ChatThread,
  FoodOrder,
  FlightBooking,
  FlightOption,
  ExecutionMethod,
} from "@/types";
import { generateId } from "@/lib/utils";

// =============================================================================
// INTENT DETECTION HELPERS
// =============================================================================

type IntentType = "shopping" | "food_delivery" | "flight_booking" | "general";
type FoodDeliverySubIntent = "reorder" | "discover" | "scheduled";

function detectIntent(content: string): IntentType {
  const lowerContent = content.toLowerCase();
  
  // Food delivery keywords
  const foodKeywords = [
    "order food", "food delivery", "hungry", "lunch", "dinner", "breakfast",
    "restaurant", "takeout", "delivery", "pizza", "sushi", "ramen", "burger",
    "noodle", "rice", "meal", "eat", "外卖", "点餐", "拉面", "订餐", "吃饭",
    "ubereats", "doordash", "grubhub", "饿了么", "美团", "usual", "favorite",
    "surprise", "suggest", "healthy", "schedule", "tomorrow"
  ];
  
  // Flight booking keywords
  const flightKeywords = [
    "flight", "book flight", "fly", "airplane", "airline", "travel",
    "trip to", "going to", "visit", "vacation", "airport", "ticket",
    "机票", "航班", "飞", "旅行", "出差", "tokyo", "东京", "paris", "巴黎",
    "new york", "london", "booking", "reserve"
  ];
  
  // Shopping keywords
  const shoppingKeywords = [
    "buy", "purchase", "wishlist", "monitor", "price", "deal", "shop",
    "amazon", "walmart", "target", "http", "https"
  ];
  
  // Check food delivery first (highest priority for specific requests)
  if (foodKeywords.some(kw => lowerContent.includes(kw))) {
    return "food_delivery";
  }
  
  // Check flight booking
  if (flightKeywords.some(kw => lowerContent.includes(kw))) {
    return "flight_booking";
  }
  
  // Check shopping
  if (shoppingKeywords.some(kw => lowerContent.includes(kw)) || content.includes("http")) {
    return "shopping";
  }
  
  return "general";
}

// Detect food delivery sub-intent
function detectFoodSubIntent(content: string): FoodDeliverySubIntent {
  const lowerContent = content.toLowerCase();
  
  // Reorder/usual order keywords
  const reorderKeywords = ["usual", "favorite", "常点", "老样子", "reorder", "again", "same"];
  
  // Discovery/surprise keywords
  const discoverKeywords = ["surprise", "suggest", "recommend", "new", "discover", "try", "什么好吃", "推荐"];
  
  // Scheduled delivery keywords
  const scheduledKeywords = ["schedule", "tomorrow", "later", "明天", "预定", "pm", "am", ":"];
  
  if (reorderKeywords.some(kw => lowerContent.includes(kw))) {
    return "reorder";
  }
  
  if (scheduledKeywords.some(kw => lowerContent.includes(kw))) {
    return "scheduled";
  }
  
  if (discoverKeywords.some(kw => lowerContent.includes(kw))) {
    return "discover";
  }
  
  // Default to reorder for specific food mentions
  return "reorder";
}

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

// Food order data by sub-intent
const foodOrderTemplates: Record<FoodDeliverySubIntent, {
  restaurant: FoodOrder["restaurant"];
  items: FoodOrder["items"];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  estimatedDelivery: string;
  scheduledTime?: string;
}> = {
  reorder: {
    restaurant: {
      id: "rest_1",
      name: "Ichiran Ramen",
      cuisine: "Japanese",
      rating: 4.8,
      deliveryTime: "25-35 min",
      deliveryFee: 2.99,
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
      address: "123 Main St",
    },
    items: [
      {
        id: "item_1",
        name: "Spicy Tonkotsu Ramen",
        description: "Rich pork bone broth with spicy miso, chashu, and soft-boiled egg",
        price: 16.99,
        quantity: 1,
        customizations: ["Extra spicy", "Extra chashu"],
      },
      {
        id: "item_2",
        name: "Gyoza (6 pcs)",
        description: "Pan-fried pork dumplings",
        price: 8.99,
        quantity: 1,
      },
    ],
    subtotal: 25.98,
    deliveryFee: 2.99,
    tax: 2.34,
    total: 31.31,
    estimatedDelivery: "30-40 min",
  },
  discover: {
    restaurant: {
      id: "rest_2",
      name: "Sakura Thai Kitchen",
      cuisine: "Thai Fusion",
      rating: 4.6,
      deliveryTime: "35-45 min",
      deliveryFee: 3.49,
      imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400",
      address: "456 Oak Ave",
    },
    items: [
      {
        id: "item_3",
        name: "Pad Thai with Shrimp",
        description: "Classic Thai stir-fried noodles with tiger shrimp, tofu, and peanuts",
        price: 18.99,
        quantity: 1,
        customizations: ["Medium spicy"],
      },
      {
        id: "item_4",
        name: "Tom Yum Soup",
        description: "Hot and sour soup with mushrooms, lemongrass, and lime",
        price: 9.99,
        quantity: 1,
      },
      {
        id: "item_5",
        name: "Mango Sticky Rice",
        description: "Sweet coconut rice with fresh mango slices",
        price: 7.99,
        quantity: 1,
      },
    ],
    subtotal: 36.97,
    deliveryFee: 3.49,
    tax: 3.33,
    total: 43.79,
    estimatedDelivery: "40-50 min",
  },
  scheduled: {
    restaurant: {
      id: "rest_3",
      name: "Green Garden Cafe",
      cuisine: "Healthy & Organic",
      rating: 4.7,
      deliveryTime: "Scheduled",
      deliveryFee: 0,
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      address: "789 Wellness Blvd",
    },
    items: [
      {
        id: "item_6",
        name: "Quinoa Buddha Bowl",
        description: "Organic quinoa with roasted vegetables, avocado, and tahini dressing",
        price: 15.99,
        quantity: 1,
        customizations: ["Extra avocado"],
      },
      {
        id: "item_7",
        name: "Green Detox Smoothie",
        description: "Spinach, kale, banana, and almond milk",
        price: 8.99,
        quantity: 1,
      },
    ],
    subtotal: 24.98,
    deliveryFee: 0,
    tax: 2.25,
    total: 27.23,
    estimatedDelivery: "Tomorrow 12:30 PM",
    scheduledTime: "Tomorrow 12:30 PM",
  },
};

function generateMockFoodOrder(subIntent: FoodDeliverySubIntent = "reorder"): FoodOrder {
  const template = foodOrderTemplates[subIntent];
  const executionMethod: ExecutionMethod = subIntent === "scheduled" ? "api" : (Math.random() > 0.5 ? "api" : "browser_automation");
  
  return {
    id: generateId(),
    restaurant: template.restaurant,
    items: template.items,
    subtotal: template.subtotal,
    deliveryFee: template.deliveryFee,
    tax: template.tax,
    total: template.total,
    estimatedDelivery: template.estimatedDelivery,
    status: subIntent === "scheduled" ? "cart" : "selecting",
    executionMethod,
    createdAt: new Date().toISOString(),
  };
}

function generateMockFlightOptions(): FlightOption[] {
  return [
    {
      id: "flight_1",
      airline: "Japan Airlines",
      airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Japan_Airlines_Logo_%282011%29.svg/200px-Japan_Airlines_Logo_%282011%29.svg.png",
      flightNumber: "JL 001",
      departure: {
        airport: "LAX",
        city: "Los Angeles",
        time: "10:30",
        date: "Dec 25, 2025",
      },
      arrival: {
        airport: "NRT",
        city: "Tokyo",
        time: "15:30+1",
        date: "Dec 26, 2025",
      },
      duration: "12h 00m",
      stops: 0,
      price: 1250.00,
      class: "economy",
      seatsAvailable: 8,
    },
    {
      id: "flight_2",
      airline: "ANA",
      airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/All_Nippon_Airways_Logo.svg/200px-All_Nippon_Airways_Logo.svg.png",
      flightNumber: "NH 105",
      departure: {
        airport: "LAX",
        city: "Los Angeles",
        time: "13:45",
        date: "Dec 25, 2025",
      },
      arrival: {
        airport: "HND",
        city: "Tokyo",
        time: "18:15+1",
        date: "Dec 26, 2025",
      },
      duration: "11h 30m",
      stops: 0,
      price: 1180.00,
      class: "economy",
      seatsAvailable: 12,
    },
    {
      id: "flight_3",
      airline: "United Airlines",
      airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/United_Airlines_Logo.svg/200px-United_Airlines_Logo.svg.png",
      flightNumber: "UA 837",
      departure: {
        airport: "LAX",
        city: "Los Angeles", 
        time: "09:00",
        date: "Dec 25, 2025",
      },
      arrival: {
        airport: "NRT",
        city: "Tokyo",
        time: "14:30+1",
        date: "Dec 26, 2025",
      },
      duration: "12h 30m",
      stops: 0,
      price: 980.00,
      class: "economy",
      seatsAvailable: 4,
    },
  ];
}

function generateMockFlightBooking(): FlightBooking {
  const flightOptions = generateMockFlightOptions();
  
  return {
    id: generateId(),
    flightOptions,
    passengers: 1,
    tripType: "round_trip",
    totalPrice: 0,
    toolCallsCost: 0.16, // Calendar check ($0.01) + Search ($0.05) + Booking ($0.10)
    status: "searching",
    calendarAvailability: {
      availableDates: ["Dec 25", "Dec 26", "Dec 27", "Dec 28"],
      conflictingEvents: ["Team Meeting - Dec 24"],
    },
    createdAt: new Date().toISOString(),
  };
}

interface ChatState {
  threads: ChatThread[];
  currentThreadId: string | null;
  currentAgentId: string | null;
  currentPlan: ExecutionPlan | null;
  pendingApprovals: ApprovalRequest[];
  isStreaming: boolean;
  isProcessing: boolean;
}

interface ChatActions {
  // Thread actions
  createThread: (agentId: string, agentName: string) => string;
  selectThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  updateThreadTitle: (threadId: string, title: string) => void;
  
  // Agent actions
  setCurrentAgent: (agentId: string) => void;
  
  // Message actions
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  
  // Plan actions
  setPlan: (plan: ExecutionPlan | null) => void;
  updatePlanStep: (stepId: string, updates: Partial<ExecutionPlan["steps"][0]>) => void;
  
  // Approval actions
  addApproval: (approval: ApprovalRequest) => void;
  handleApproval: (approvalId: string, approved: boolean) => Promise<void>;
  
  // Utility
  clearCurrentChat: () => void;
  getCurrentThread: () => ChatThread | null;
  getThreadsByAgent: (agentId: string) => ChatThread[];
}

type ChatStore = ChatState & ChatActions;

// Generate thread title from first message
function generateThreadTitle(content: string): string {
  const cleaned = content.replace(/https?:\/\/[^\s]+/g, "[link]").trim();
  if (cleaned.length <= 30) return cleaned;
  return cleaned.substring(0, 30) + "...";
}

// =============================================================================
// REQUEST HANDLERS
// =============================================================================

// Helper type for store functions
type StoreGet = () => ChatStore;
type StoreSet = (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void;
type AddMessageFn = (message: Message) => void;

// Demo A: Shopping Request Handler
async function handleShoppingRequest(
  get: StoreGet,
  set: StoreSet,
  addMessage: AddMessageFn
) {
  const plan: ExecutionPlan = {
    id: generateId(),
    title: "Auto-Purchase Plan",
    description: "Monitor and purchase item when price target is met",
    steps: [
      {
        id: generateId(),
        name: "Parse Product URL",
        description: "Extract product information from the provided link",
        status: "completed",
        estimatedCost: 0,
        estimatedTime: "1s",
      },
      {
        id: generateId(),
        name: "Fetch Current Price",
        description: "Get the current price from the merchant",
        status: "completed",
        estimatedCost: 0.01,
        estimatedTime: "2s",
      },
      {
        id: generateId(),
        name: "Set Price Alert",
        description: "Configure price monitoring with your target",
        status: "pending",
        estimatedCost: 0,
        estimatedTime: "1s",
      },
      {
        id: generateId(),
        name: "Auto-Checkout",
        description: "Automatically purchase when price drops to target",
        status: "pending",
        estimatedCost: 0.05,
        estimatedTime: "~varies",
      },
    ],
    totalEstimatedCost: 0.06,
    totalEstimatedTime: "Monitoring until target price reached",
    status: "draft",
    createdAt: new Date().toISOString(),
  };

  set({ currentPlan: plan });

  const approval: ApprovalRequest = {
    id: generateId(),
    planId: plan.id,
    type: "plan",
    title: "Approve Auto-Purchase Plan",
    description:
      "The agent will monitor the product price and automatically purchase when your target price is reached.",
    status: "pending",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  get().addApproval(approval);

  const assistantMessage: Message = {
    id: generateId(),
    role: "assistant",
    content:
      "I've analyzed your request and created an auto-purchase plan. Here's what I'll do:\n\n1. **Parse the product URL** to extract item details\n2. **Fetch the current price** from the merchant\n3. **Set up price monitoring** based on your target\n4. **Auto-checkout** when the price drops to your target\n\nPlease review the plan below and approve to proceed.",
    status: "sent",
    createdAt: new Date().toISOString(),
    metadata: {
      plan,
      approval,
    },
  };

  addMessage(assistantMessage);
}

// Demo B: Food Delivery Request Handler
async function handleFoodDeliveryRequest(
  get: StoreGet,
  set: StoreSet,
  addMessage: AddMessageFn,
  userMessage: string
) {
  // Detect the sub-intent to show different scenarios
  const subIntent = detectFoodSubIntent(userMessage);
  const foodOrder = generateMockFoodOrder(subIntent);
  const methodLabel = foodOrder.executionMethod === "api" ? "Using API" : "Using Browser Automation";

  // Generate different plan titles and descriptions based on sub-intent
  const planConfig = {
    reorder: {
      title: "Quick Reorder",
      description: `Reordering your usual from ${foodOrder.restaurant.name}`,
      introMessage: `I found your favorite order from **${foodOrder.restaurant.name}**! 🍜`,
      featureNote: "Based on your order history, I've prepared your usual order.",
    },
    discover: {
      title: "New Restaurant Discovery",
      description: `Trying something new at ${foodOrder.restaurant.name}`,
      introMessage: `I found something exciting for you! **${foodOrder.restaurant.name}** is highly rated and matches your preferences. 🌟`,
      featureNote: "This restaurant is trending in your area with excellent reviews!",
    },
    scheduled: {
      title: "Scheduled Delivery",
      description: `Pre-order from ${foodOrder.restaurant.name} for later`,
      introMessage: `I've set up a scheduled delivery from **${foodOrder.restaurant.name}**! 📅`,
      featureNote: `Scheduled for: **${foodOrder.estimatedDelivery}** - Free delivery for scheduled orders!`,
    },
  };

  const config = planConfig[subIntent];

  // Build steps based on sub-intent
  const steps = subIntent === "scheduled" 
    ? [
        {
          id: generateId(),
          name: "Parse Schedule Request",
          description: "Understanding your delivery time preferences",
          status: "completed" as const,
          estimatedCost: 0,
          estimatedTime: "1s",
        },
        {
          id: generateId(),
          name: "Check Restaurant Schedule",
          description: `${foodOrder.restaurant.name} is available for scheduled orders`,
          status: "completed" as const,
          estimatedCost: 0.01,
          estimatedTime: "2s",
        },
        {
          id: generateId(),
          name: "Reserve Time Slot",
          description: `Reserved delivery slot: ${foodOrder.estimatedDelivery}`,
          status: "completed" as const,
          estimatedCost: 0.01,
          estimatedTime: "2s",
        },
        {
          id: generateId(),
          name: "Login to Platform",
          description: "⚠️ SENSITIVE: Requires your approval to proceed with login",
          status: "awaiting_approval" as const,
          estimatedCost: 0,
          estimatedTime: "~manual",
        },
        {
          id: generateId(),
          name: "Schedule Order",
          description: "Confirm scheduled delivery order",
          status: "pending" as const,
          estimatedCost: 0,
          estimatedTime: "3s",
        },
        {
          id: generateId(),
          name: "Payment Hold",
          description: "⚠️ SENSITIVE: Pre-authorize payment for scheduled order",
          status: "pending" as const,
          estimatedCost: 0.02,
          estimatedTime: "~manual",
        },
      ]
    : subIntent === "discover"
    ? [
        {
          id: generateId(),
          name: "Analyze Preferences",
          description: "Understanding your taste preferences and dietary needs",
          status: "completed" as const,
          estimatedCost: 0.01,
          estimatedTime: "2s",
        },
        {
          id: generateId(),
          name: "Search New Restaurants",
          description: `Discovered ${foodOrder.restaurant.name} - ${foodOrder.restaurant.rating}★ (${foodOrder.restaurant.cuisine})`,
          status: "completed" as const,
          estimatedCost: 0.03,
          estimatedTime: "3s",
        },
        {
          id: generateId(),
          name: "Curate Menu Selection",
          description: "Selected top-rated dishes based on your preferences",
          status: "completed" as const,
          estimatedCost: 0.02,
          estimatedTime: "2s",
        },
        {
          id: generateId(),
          name: "Login to Platform",
          description: "⚠️ SENSITIVE: Requires your approval to proceed with login",
          status: "awaiting_approval" as const,
          estimatedCost: 0,
          estimatedTime: "~manual",
        },
        {
          id: generateId(),
          name: "Add to Cart",
          description: "Adding curated selection to your cart",
          status: "pending" as const,
          estimatedCost: 0,
          estimatedTime: "3s",
        },
        {
          id: generateId(),
          name: "Checkout & Pay",
          description: "⚠️ SENSITIVE: Final order confirmation required",
          status: "pending" as const,
          estimatedCost: 0.02,
          estimatedTime: "~manual",
        },
      ]
    : [
        {
          id: generateId(),
          name: "Load Order History",
          description: "Retrieving your previous orders and preferences",
          status: "completed" as const,
          estimatedCost: 0,
          estimatedTime: "1s",
        },
        {
          id: generateId(),
          name: "Match Favorite Restaurant",
          description: `Found your usual spot: ${foodOrder.restaurant.name} - ${foodOrder.restaurant.rating}★`,
          status: "completed" as const,
          estimatedCost: 0.01,
          estimatedTime: "2s",
        },
        {
          id: generateId(),
          name: "Prepare Usual Order",
          description: "Pre-filled your favorite items with customizations",
          status: "completed" as const,
          estimatedCost: 0.01,
          estimatedTime: "2s",
        },
        {
          id: generateId(),
          name: "Login to Platform",
          description: "⚠️ SENSITIVE: Requires your approval to proceed with login",
          status: "awaiting_approval" as const,
          estimatedCost: 0,
          estimatedTime: "~manual",
        },
        {
          id: generateId(),
          name: "Quick Add to Cart",
          description: "One-click add your saved order",
          status: "pending" as const,
          estimatedCost: 0,
          estimatedTime: "2s",
        },
        {
          id: generateId(),
          name: "Checkout & Pay",
          description: "⚠️ SENSITIVE: Final order confirmation required",
          status: "pending" as const,
          estimatedCost: 0.02,
          estimatedTime: "~manual",
        },
      ];

  const plan: ExecutionPlan = {
    id: generateId(),
    title: config.title,
    description: `${config.description} (${methodLabel})`,
    steps,
    totalEstimatedCost: foodOrder.total + 0.05,
    totalEstimatedTime: foodOrder.estimatedDelivery,
    status: "draft",
    createdAt: new Date().toISOString(),
  };

  set({ currentPlan: plan });

  const approval: ApprovalRequest = {
    id: generateId(),
    planId: plan.id,
    type: "plan",
    title: `Approve ${config.title}`,
    description: `Order from ${foodOrder.restaurant.name}. Total: $${foodOrder.total.toFixed(2)} (includes delivery & tax). ${subIntent === "scheduled" ? `Scheduled: ${foodOrder.estimatedDelivery}` : `Delivery in ${foodOrder.estimatedDelivery}`}.`,
    amount: foodOrder.total,
    status: "pending",
    expiresAt: new Date(Date.now() + 1800000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  get().addApproval(approval);

  // Build customized message content
  const itemsList = foodOrder.items.map(item => {
    const customStr = item.customizations?.length ? ` *(${item.customizations.join(", ")})*` : "";
    return `• ${item.name} x${item.quantity} - $${item.price.toFixed(2)}${customStr}`;
  }).join('\n');

  const deliveryFeeText = foodOrder.deliveryFee === 0 
    ? "• Delivery Fee: **FREE** 🎉" 
    : `• Delivery Fee: $${foodOrder.deliveryFee.toFixed(2)}`;

  const assistantMessage: Message = {
    id: generateId(),
    role: "assistant",
    content: `${config.introMessage}\n\n**Connection Method:** ${methodLabel}\n\n💡 ${config.featureNote}\n\n**Your Order:**\n${itemsList}\n\n**Order Summary:**\n• Subtotal: $${foodOrder.subtotal.toFixed(2)}\n${deliveryFeeText}\n• Tax: $${foodOrder.tax.toFixed(2)}\n• **Total: $${foodOrder.total.toFixed(2)}**\n\n⏱️ ${subIntent === "scheduled" ? "Scheduled Delivery:" : "Estimated Delivery:"} ${foodOrder.estimatedDelivery}\n\n⚠️ This order includes **sensitive steps** (login & checkout) that will require your approval.\n\nPlease review and approve the plan to proceed.`,
    status: "sent",
    createdAt: new Date().toISOString(),
    metadata: {
      plan,
      approval,
      foodOrder,
    },
  };

  addMessage(assistantMessage);
}

// Demo C: Flight Booking Request Handler
async function handleFlightBookingRequest(
  get: StoreGet,
  set: StoreSet,
  addMessage: AddMessageFn
) {
  const flightBooking = generateMockFlightBooking();

  const plan: ExecutionPlan = {
    id: generateId(),
    title: "Flight Booking",
    description: "Search and book flights with calendar integration",
    steps: [
      {
        id: generateId(),
        name: "Check Calendar",
        description: "Checking your calendar for availability",
        status: "completed",
        estimatedCost: 0.01,
        estimatedTime: "2s",
      },
      {
        id: generateId(),
        name: "Search Flights",
        description: `Found ${flightBooking.flightOptions.length} flight options`,
        status: "completed",
        estimatedCost: 0.05,
        estimatedTime: "5s",
      },
      {
        id: generateId(),
        name: "Select Flight",
        description: "Waiting for your flight selection",
        status: "awaiting_approval",
        estimatedCost: 0,
        estimatedTime: "~manual",
      },
      {
        id: generateId(),
        name: "Book Flight",
        description: "⚠️ Requires approval for payment",
        status: "pending",
        estimatedCost: 0.10,
        estimatedTime: "10s",
      },
      {
        id: generateId(),
        name: "Process Payment",
        description: "Complete payment via x402 protocol",
        status: "pending",
        estimatedCost: 0,
        estimatedTime: "5s",
      },
      {
        id: generateId(),
        name: "Generate Receipt",
        description: "Create on-chain payment receipt",
        status: "pending",
        estimatedCost: 0,
        estimatedTime: "3s",
      },
    ],
    totalEstimatedCost: 0.16,
    totalEstimatedTime: "~25s + manual selection",
    status: "draft",
    createdAt: new Date().toISOString(),
  };

  set({ currentPlan: plan });

  // Show calendar availability first
  const calendarInfo = flightBooking.calendarAvailability;
  const calendarMessage = calendarInfo 
    ? `\n\n📅 **Calendar Check (x402: $0.01)**\n• Available dates: ${calendarInfo.availableDates.join(', ')}\n• Conflicts: ${calendarInfo.conflictingEvents.length > 0 ? calendarInfo.conflictingEvents.join(', ') : 'None'}`
    : '';

  // Build flight options table
  const flightOptionsText = flightBooking.flightOptions.map((flight, idx) => 
    `**Option ${idx + 1}: ${flight.airline}** (${flight.flightNumber})\n` +
    `   ${flight.departure.city} (${flight.departure.airport}) → ${flight.arrival.city} (${flight.arrival.airport})\n` +
    `   🕐 ${flight.departure.time} - ${flight.arrival.time} | ⏱️ ${flight.duration} | ✈️ ${flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}\n` +
    `   💰 **$${flight.price.toFixed(2)}** | 🪑 ${flight.seatsAvailable} seats left`
  ).join('\n\n');

  const approval: ApprovalRequest = {
    id: generateId(),
    planId: plan.id,
    type: "plan",
    title: "Review Flight Options",
    description: "Please select a flight from the options below to proceed with booking.",
    status: "pending",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  get().addApproval(approval);

  const assistantMessage: Message = {
    id: generateId(),
    role: "assistant",
    content: `I've searched for flights to Tokyo for you.${calendarMessage}\n\n✈️ **Flight Search (x402: $0.05)**\n\n${flightOptionsText}\n\n**x402 Tool Costs:**\n• Calendar API: $0.01\n• Flight Search: $0.05\n• Booking (if approved): $0.10\n• **Total Tool Costs: $${flightBooking.toolCallsCost.toFixed(2)}**\n\nPlease review the options and approve to select a flight.`,
    status: "sent",
    createdAt: new Date().toISOString(),
    metadata: {
      plan,
      approval,
      flightBooking,
    },
  };

  addMessage(assistantMessage);
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      threads: [],
      currentThreadId: null,
      currentAgentId: null,
      currentPlan: null,
      pendingApprovals: [],
      isStreaming: false,
      isProcessing: false,

      // Thread actions
      createThread: (agentId: string, agentName: string) => {
        const newThread: ChatThread = {
          id: generateId(),
          title: "New Chat",
          agentId,
          agentName,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          threads: [newThread, ...state.threads],
          currentThreadId: newThread.id,
          currentAgentId: agentId,
          currentPlan: null,
          pendingApprovals: [],
        }));

        return newThread.id;
      },

      selectThread: (threadId: string) => {
        const thread = get().threads.find((t) => t.id === threadId);
        if (thread) {
          set({
            currentThreadId: threadId,
            currentAgentId: thread.agentId,
            currentPlan: null,
            pendingApprovals: [],
          });
        }
      },

      deleteThread: (threadId: string) => {
        const { currentThreadId, threads } = get();
        const newThreads = threads.filter((t) => t.id !== threadId);
        
        set({
          threads: newThreads,
          currentThreadId: currentThreadId === threadId ? null : currentThreadId,
        });
      },

      updateThreadTitle: (threadId: string, title: string) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId ? { ...t, title, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      // Agent actions
      setCurrentAgent: (agentId: string) => {
        set({ currentAgentId: agentId });
      },

      // Message actions
      sendMessage: async (content: string) => {
        const { currentThreadId, currentAgentId, threads, addMessage, createThread } = get();
        
        // If no current thread, create one
        let threadId = currentThreadId;
        if (!threadId && currentAgentId) {
          // Get agent name from threads or use default
          const existingThread = threads.find((t) => t.agentId === currentAgentId);
          const agentName = existingThread?.agentName || "AI Agent";
          threadId = createThread(currentAgentId, agentName);
        }
        
        if (!threadId) return;

        // Add user message
        const userMessage: Message = {
          id: generateId(),
          role: "user",
          content,
          status: "sent",
          createdAt: new Date().toISOString(),
        };
        addMessage(userMessage);

        // Update thread title if it's the first message
        const thread = get().threads.find((t) => t.id === threadId);
        if (thread && thread.messages.length === 1) {
          get().updateThreadTitle(threadId, generateThreadTitle(content));
        }

        set({ isProcessing: true, isStreaming: true });

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Detect intent type
        const intentType = detectIntent(content);

        if (intentType === "food_delivery") {
          // Demo B: Food Delivery
          await handleFoodDeliveryRequest(get, set, addMessage, content);
        } else if (intentType === "flight_booking") {
          // Demo C: Flight Booking
          await handleFlightBookingRequest(get, set, addMessage);
        } else if (intentType === "shopping") {
          // Demo A: Shopping/Auto-purchase
          await handleShoppingRequest(get, set, addMessage);
        } else {
          // General response
          const assistantMessage: Message = {
            id: generateId(),
            role: "assistant",
            content:
              "I'm your AI assistant. I can help you with:\n\n• **Shopping** - Monitor prices and auto-purchase items\n• **Food Delivery** - Order from your favorite restaurants\n• **Travel** - Book flights and plan trips\n\nJust tell me what you need!",
            status: "sent",
            createdAt: new Date().toISOString(),
          };

          addMessage(assistantMessage);
        }

        set({ isProcessing: false, isStreaming: false });
      },

      addMessage: (message: Message) => {
        const { currentThreadId } = get();
        if (!currentThreadId) return;

        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === currentThreadId
              ? {
                  ...t,
                  messages: [...t.messages, message],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      updateMessage: (id: string, updates: Partial<Message>) => {
        const { currentThreadId } = get();
        if (!currentThreadId) return;

        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === currentThreadId
              ? {
                  ...t,
                  messages: t.messages.map((msg) =>
                    msg.id === id ? { ...msg, ...updates } : msg
                  ),
                }
              : t
          ),
        }));
      },

      setPlan: (plan: ExecutionPlan | null) => {
        set({ currentPlan: plan });
      },

      updatePlanStep: (stepId: string, updates: Partial<ExecutionPlan["steps"][0]>) => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const updatedSteps = currentPlan.steps.map((step) =>
          step.id === stepId ? { ...step, ...updates } : step
        );

        set({
          currentPlan: { ...currentPlan, steps: updatedSteps },
        });
      },

      addApproval: (approval: ApprovalRequest) => {
        set((state) => ({
          pendingApprovals: [...state.pendingApprovals, approval],
        }));
      },

      handleApproval: async (approvalId: string, approved: boolean) => {
        const { pendingApprovals, currentPlan, addMessage, updatePlanStep } = get();

        // Find the approval being processed
        const approval = pendingApprovals.find(a => a.id === approvalId);
        if (!approval) return;

        // Check if this is a sensitive step approval
        const isSensitiveStepApproval = approval.type === "sensitive_action" && approval.stepId;

        // Update approval status
        const newStatus = approved ? "approved" : "rejected";
        const updatedApprovals = pendingApprovals.map((a) =>
          a.id === approvalId
            ? { ...a, status: newStatus as "approved" | "rejected" }
            : a
        );

        set({ pendingApprovals: updatedApprovals });

        if (approved && currentPlan) {
          // Determine plan type based on title
          const isFoodOrder = currentPlan.title.includes("Food") || currentPlan.title.includes("Reorder") || currentPlan.title.includes("Discovery") || currentPlan.title.includes("Scheduled");
          const isFlightBooking = currentPlan.title === "Flight Booking";

          // If this is a sensitive step approval, mark that step as completed first
          if (isSensitiveStepApproval && approval.stepId) {
            updatePlanStep(approval.stepId, { status: "completed" });
            // Need to get fresh plan after update
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Update plan status
          set({
            currentPlan: { ...get().currentPlan!, status: "executing" },
          });

          // Get fresh plan state
          const freshPlan = get().currentPlan;
          if (!freshPlan) return;

          // Execute steps with pauses for sensitive actions
          for (let i = 0; i < freshPlan.steps.length; i++) {
            const step = freshPlan.steps[i];
            if (step.status === "completed") continue;

            // Check for sensitive steps that need additional approval
            const isSensitiveStep = step.description.includes("⚠️") || 
                                   step.status === "awaiting_approval";

            if (isSensitiveStep && step.status === "awaiting_approval") {
              // Create sensitive action approval
              const sensitiveApproval: ApprovalRequest = {
                id: generateId(),
                planId: freshPlan.id,
                stepId: step.id,
                type: "sensitive_action",
                title: `Confirm: ${step.name}`,
                description: step.description.replace("⚠️ SENSITIVE: ", ""),
                status: "pending",
                expiresAt: new Date(Date.now() + 600000).toISOString(),
                createdAt: new Date().toISOString(),
              };

              get().addApproval(sensitiveApproval);
              
              // Add message about sensitive step
              const sensitiveMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: `⚠️ **Sensitive Step: ${step.name}**\n\n${step.description.replace("⚠️ SENSITIVE: ", "")}\n\nPlease approve to continue.`,
                status: "sent",
                createdAt: new Date().toISOString(),
                metadata: {
                  approval: sensitiveApproval,
                },
              };

              addMessage(sensitiveMessage);
              
              // Don't continue execution until sensitive step is approved
              return;
            }

            updatePlanStep(step.id, { status: "in_progress" });
            await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
            updatePlanStep(step.id, { status: "completed" });
          }

          // Get the latest plan state and mark as completed
          const finalPlan = get().currentPlan;
          if (finalPlan) {
            set({
              currentPlan: { ...finalPlan, status: "completed" },
            });
          }

          // Generate completion message based on plan type
          let completionMessage: Message;

          if (isFoodOrder) {
            completionMessage = {
              id: generateId(),
              role: "assistant",
              content:
                "✅ **Order Placed Successfully!**\n\n🍜 Your food order has been confirmed!\n\n**Order Details:**\n• Restaurant: Ichiran Ramen\n• Estimated Delivery: 30-40 min\n• Order #: ORD-" + generateId().substring(0, 8).toUpperCase() + "\n\n📱 You'll receive updates on your order status.\n\n**x402 Payment Receipt:**\n• Tool calls: $0.05\n• Transaction recorded on-chain\n\nYou can view the full receipt in your Activity Feed.",
              status: "sent",
              createdAt: new Date().toISOString(),
            };
          } else if (isFlightBooking) {
            completionMessage = {
              id: generateId(),
              role: "assistant", 
              content:
                "✅ **Flight Booked Successfully!**\n\n✈️ Your flight has been confirmed!\n\n**Booking Details:**\n• Confirmation #: FL-" + generateId().substring(0, 8).toUpperCase() + "\n• Route: Los Angeles → Tokyo\n• Date: Dec 25, 2025\n\n**x402 Payment Summary:**\n• Calendar Check: $0.01\n• Flight Search: $0.05\n• Booking Fee: $0.10\n• **Total Tool Costs: $0.16**\n\n📧 Confirmation email sent to your registered address.\n\n**On-Chain Receipt:**\n• tx: 0x" + generateId() + "\n• Verified and recorded on Base network\n\nYou can view the full receipt and ticket details in your Activity Feed.",
              status: "sent",
              createdAt: new Date().toISOString(),
            };
          } else {
            completionMessage = {
              id: generateId(),
              role: "assistant",
              content:
                "✅ **Plan Executed Successfully!**\n\nI've set up price monitoring for your item. I'll automatically purchase it when the price drops to your target.\n\nYou can view the monitoring status in your Activity Feed.",
              status: "sent",
              createdAt: new Date().toISOString(),
            };
          }

          addMessage(completionMessage);
        } else if (!approved) {
          // Add rejection message
          const rejectionMessage: Message = {
            id: generateId(),
            role: "assistant",
            content:
              "I understand. The plan has been cancelled. Let me know if you'd like to try something different!",
            status: "sent",
            createdAt: new Date().toISOString(),
          };

          addMessage(rejectionMessage);

          set({ currentPlan: null });
        }

        // Remove the processed approval
        set((state) => ({
          pendingApprovals: state.pendingApprovals.filter((a) => a.id !== approvalId),
        }));
      },

      clearCurrentChat: () => {
        set({
          currentThreadId: null,
          currentPlan: null,
          pendingApprovals: [],
        });
      },

      getCurrentThread: () => {
        const { threads, currentThreadId } = get();
        return threads.find((t) => t.id === currentThreadId) || null;
      },

      getThreadsByAgent: (agentId: string) => {
        const { threads } = get();
        return threads.filter((t) => t.agentId === agentId);
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        threads: state.threads,
        currentThreadId: state.currentThreadId,
        currentAgentId: state.currentAgentId,
      }),
    }
  )
);
