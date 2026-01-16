import { create } from "zustand";
import type { Agent, ActivityEvent } from "@/types";

export interface Merchant {
  id: string;
  name: string;
  domain: string;
  x402Supported: boolean;
  integrationStatus: "active" | "pending" | "inactive";
  transactionCount: number;
  totalVolume: number;
  lastTransactionAt?: string;
  channels: string[]; // Channel IDs that support this merchant
}

interface MerchantState {
  merchants: Merchant[];
  isLoading: boolean;
}

interface MerchantActions {
  fetchMerchants: (agents: Agent[], events: ActivityEvent[]) => void;
  getMerchantByDomain: (domain: string) => Merchant | undefined;
}

type MerchantStore = MerchantState & MerchantActions;

// Mock merchants for demonstration
const mockMerchants: Merchant[] = [
  {
    id: "merchant_1",
    name: "Amazon",
    domain: "amazon.com",
    x402Supported: true,
    integrationStatus: "active",
    transactionCount: 15,
    totalVolume: 250.99,
    lastTransactionAt: new Date(Date.now() - 3600000).toISOString(),
    channels: ["agent_1"],
  },
  {
    id: "merchant_2",
    name: "DoorDash",
    domain: "doordash.com",
    x402Supported: true,
    integrationStatus: "active",
    transactionCount: 8,
    totalVolume: 120.50,
    lastTransactionAt: new Date(Date.now() - 7200000).toISOString(),
    channels: ["agent_2"],
  },
];

export const useMerchantStore = create<MerchantStore>((set, get) => ({
  merchants: [],
  isLoading: false,

  fetchMerchants: (agents, events) => {
    set({ isLoading: true });

    // Extract merchants from agents' allowedMerchants
    const merchantMap = new Map<string, Merchant>();

    // Process agents
    agents.forEach((agent) => {
      agent.allowedMerchants?.forEach((merchantDomain) => {
        if (!merchantMap.has(merchantDomain)) {
          merchantMap.set(merchantDomain, {
            id: `merchant_${merchantDomain.replace(/\./g, "_")}`,
            name: merchantDomain.split(".")[0].charAt(0).toUpperCase() + merchantDomain.split(".")[0].slice(1),
            domain: merchantDomain,
            x402Supported: false, // Will be updated from events
            integrationStatus: "active",
            transactionCount: 0,
            totalVolume: 0,
            channels: [],
          });
        }
        const merchant = merchantMap.get(merchantDomain)!;
        if (!merchant.channels.includes(agent.id)) {
          merchant.channels.push(agent.id);
        }
      });
    });

    // Process events to get merchant statistics
    events.forEach((event) => {
      const merchantName = event.metadata?.merchant as string | undefined;
      if (merchantName) {
        // Try to find merchant by name or domain
        let merchant: Merchant | undefined;
        for (const [domain, m] of merchantMap.entries()) {
          if (m.name.toLowerCase().includes(merchantName.toLowerCase()) || 
              domain.includes(merchantName.toLowerCase())) {
            merchant = m;
            break;
          }
        }

        if (!merchant) {
          // Create new merchant from event
          const domain = merchantName.toLowerCase().replace(/\s+/g, "");
          merchant = {
            id: `merchant_${domain}`,
            name: merchantName,
            domain,
            x402Supported: event.type === "payment_402",
            integrationStatus: "active",
            transactionCount: 0,
            totalVolume: 0,
            channels: event.agentId ? [event.agentId] : [],
          };
          merchantMap.set(domain, merchant);
        }

        // Update statistics
        merchant.transactionCount++;
        const amount = event.metadata?.amount as number | undefined;
        if (amount) {
          merchant.totalVolume += amount;
        }
        if (event.type === "payment_402") {
          merchant.x402Supported = true;
        }
        if (!merchant.lastTransactionAt || new Date(event.createdAt) > new Date(merchant.lastTransactionAt)) {
          merchant.lastTransactionAt = event.createdAt;
        }
      }
    });

    const merchants = Array.from(merchantMap.values());

    // Add mock merchants if no real merchants exist
    if (merchants.length === 0) {
      set({
        merchants: mockMerchants,
        isLoading: false,
      });
    } else {
      set({
        merchants,
        isLoading: false,
      });
    }
  },

  getMerchantByDomain: (domain) => {
    const { merchants } = get();
    return merchants.find((m) => m.domain === domain || m.domain.includes(domain));
  },
}));
