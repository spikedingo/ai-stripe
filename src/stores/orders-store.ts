import { create } from "zustand";
import { createAgentApiClient } from "@/api/agent-client";

// Order type based on typical payment/order structure
// Adjust these types based on actual API response
export interface Order {
  id: string;
  agent_id: string;
  agent_name?: string;
  merchant: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  tx_hash?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  // Additional fields that might be in the response
  metadata?: Record<string, unknown>;
}

export interface OrdersResponse {
  data: Order[];
  has_more: boolean;
  next_cursor: string | null;
}

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
}

interface OrdersActions {
  fetchOrders: (token?: string) => Promise<void>;
  loadMoreOrders: (token?: string) => Promise<void>;
  clearOrders: () => void;
}

type OrdersStore = OrdersState & OrdersActions;

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  // Initial state
  orders: [],
  isLoading: false,
  error: null,
  hasMore: false,
  nextCursor: null,

  // Actions
  fetchOrders: async (token?: string) => {
    set({ isLoading: true, error: null });

    try {
      if (!token) {
        throw new Error("Access token is required");
      }

      const apiClient = createAgentApiClient(token);
      const response = await apiClient.getOrders();

      console.log("[OrdersStore] Raw API response:", response);

      // Parse response - handle different response formats
      let orders: Order[] = [];
      let hasMore = false;
      let nextCursor: string | null = null;

      if (response && typeof response === "object") {
        // Handle { data: { data: [], has_more, next_cursor } } format
        if ("data" in response) {
          const responseData = response.data as unknown;
          if (
            responseData &&
            typeof responseData === "object" &&
            "data" in responseData
          ) {
            const ordersData = responseData as OrdersResponse;
            orders = ordersData.data || [];
            hasMore = ordersData.has_more || false;
            nextCursor = ordersData.next_cursor || null;
          } else if (Array.isArray(responseData)) {
            orders = responseData as Order[];
          }
        }
      }

      console.log(`[OrdersStore] Orders fetched:`, orders.length);

      set({
        orders,
        hasMore,
        nextCursor,
        isLoading: false,
      });
    } catch (error) {
      console.error(`[OrdersStore] Failed to fetch orders:`, error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch orders",
        isLoading: false,
      });
    }
  },

  loadMoreOrders: async (token?: string) => {
    const { nextCursor, hasMore, orders } = get();

    if (!hasMore || !nextCursor) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      if (!token) {
        throw new Error("Access token is required");
      }

      const apiClient = createAgentApiClient(token);
      const response = await apiClient.getOrders({ cursor: nextCursor });

      let newOrders: Order[] = [];
      let newHasMore = false;
      let newNextCursor: string | null = null;

      if (response && typeof response === "object" && "data" in response) {
        const responseData = response.data as unknown;
        if (
          responseData &&
          typeof responseData === "object" &&
          "data" in responseData
        ) {
          const ordersData = responseData as OrdersResponse;
          newOrders = ordersData.data || [];
          newHasMore = ordersData.has_more || false;
          newNextCursor = ordersData.next_cursor || null;
        } else if (Array.isArray(responseData)) {
          newOrders = responseData as Order[];
        }
      }

      set({
        orders: [...orders, ...newOrders],
        hasMore: newHasMore,
        nextCursor: newNextCursor,
        isLoading: false,
      });
    } catch (error) {
      console.error(`[OrdersStore] Failed to load more orders:`, error);
      set({
        error: error instanceof Error ? error.message : "Failed to load more orders",
        isLoading: false,
      });
    }
  },

  clearOrders: () => {
    set({
      orders: [],
      hasMore: false,
      nextCursor: null,
      error: null,
    });
  },
}));
