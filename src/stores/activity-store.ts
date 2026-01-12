import { create } from "zustand";
import type { ActivityEvent, ActivityType, TimelineEvent } from "@/types";
import { generateId } from "@/lib/utils";
import { createAgentApiClient } from "@/api/agent-client";

interface ActivityState {
  events: ActivityEvent[];
  isLoading: boolean;
}

interface ActivityActions {
  fetchEvents: (token?: string) => Promise<void>;
  addEvent: (type: ActivityType, title: string, description: string, metadata?: Record<string, unknown>) => void;
  clearEvents: () => void;
}

type ActivityStore = ActivityState & ActivityActions;

// Mock events
const mockEvents: ActivityEvent[] = [
  {
    id: "evt_1",
    type: "agent_created",
    title: "Agent Created",
    description: "Deal Hunter agent was created",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "evt_2",
    type: "wishlist_added",
    title: "Item Added to Wishlist",
    description: "Sony WH-1000XM5 Headphones added to monitoring",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    metadata: {
      productUrl: "https://amazon.com/dp/B09V3KXJPB",
      targetPrice: 299,
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "evt_3",
    type: "tool_call",
    title: "Price Check API",
    description: "Fetched current price from Amazon",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    metadata: {
      tool: "price_check",
      cost: 0.01,
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "evt_4",
    type: "payment_402",
    title: "x402 Payment",
    description: "Paid $0.01 for API call via x402 protocol",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    metadata: {
      amount: 0.01,
      txHash: "0x1234...5678",
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "evt_5",
    type: "price_alert",
    title: "Price Drop Alert",
    description: "Sony WH-1000XM5 dropped to $319.99 (was $349.99)",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    metadata: {
      previousPrice: 349.99,
      currentPrice: 319.99,
      targetPrice: 299,
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "evt_6",
    type: "approval_requested",
    title: "Approval Requested",
    description: "Deal Hunter is requesting approval for auto-purchase plan",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "evt_7",
    type: "approval_granted",
    title: "Approval Granted",
    description: "Auto-purchase plan approved by user",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "evt_8",
    type: "transaction_completed",
    title: "Purchase Completed",
    description: "Successfully purchased item from Amazon for $15.99",
    agentId: "agent_1",
    agentName: "Deal Hunter",
    metadata: {
      amount: 15.99,
      merchant: "Amazon",
      txHash: "0xabcd...ef01",
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const useActivityStore = create<ActivityStore>((set, get) => ({
  // Initial state
  events: [],
  isLoading: false,

  // Actions
  fetchEvents: async (token?: string) => {
    set({ isLoading: true });

    try {
      if (!token) {
        throw new Error("Access token is required");
      }
      const apiClient = createAgentApiClient(token);
      const response = await apiClient.getTimeline();
      
      // Convert TimelineEvent to ActivityEvent
      const timelineEvents = response as unknown as TimelineEvent[];
      const events: ActivityEvent[] = timelineEvents.map((event) => ({
        id: event.id,
        type: event.type as ActivityType,
        title: event.title,
        description: event.description,
        agentId: event.agent_id,
        agentName: event.agent_name,
        metadata: event.metadata,
        createdAt: event.created_at,
      }));

      console.log("[ActivityStore] Timeline events fetched");
      set({
        events: events.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        isLoading: false,
      });
    } catch (error) {
      console.error("[ActivityStore] Failed to fetch timeline:", error);
      
      // Fallback to mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({
        events: mockEvents.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        isLoading: false,
      });
    }
  },

  addEvent: (type, title, description, metadata) => {
    const newEvent: ActivityEvent = {
      id: `evt_${generateId()}`,
      type,
      title,
      description,
      metadata,
      createdAt: new Date().toISOString(),
    };

    const { events } = get();
    set({
      events: [newEvent, ...events],
    });
  },

  clearEvents: () => {
    set({ events: [] });
  },
}));






