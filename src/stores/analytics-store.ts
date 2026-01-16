import { create } from "zustand";
import type { ActivityEvent, Agent } from "@/types";
import { filterPaymentEvents, mapActivityToTransaction } from "@/lib/payment-mapper";

export interface PaymentAnalytics {
  totalVolume: {
    today: number;
    week: number;
    month: number;
  };
  successRate: number;
  x402UsageRate: number;
  activeChannels: number;
  pendingApprovals: number;
  transactionsByMerchant: Record<string, { count: number; volume: number }>;
  transactionsByChannel: Record<string, { count: number; volume: number }>;
  x402Transactions: number;
  completedTransactions: number;
  failedTransactions: number;
}

interface AnalyticsState {
  analytics: PaymentAnalytics | null;
  isLoading: boolean;
}

interface AnalyticsActions {
  calculateAnalytics: (agents: Agent[], events: ActivityEvent[]) => void;
}

type AnalyticsStore = AnalyticsState & AnalyticsActions;

const initialAnalytics: PaymentAnalytics = {
  totalVolume: {
    today: 0,
    week: 0,
    month: 0,
  },
  successRate: 0,
  x402UsageRate: 0,
  activeChannels: 0,
  pendingApprovals: 0,
  transactionsByMerchant: {},
  transactionsByChannel: {},
  x402Transactions: 0,
  completedTransactions: 0,
  failedTransactions: 0,
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  analytics: null,
  isLoading: false,

  calculateAnalytics: (agents, events) => {
    set({ isLoading: true });

    // Filter payment-related events
    const paymentEvents = filterPaymentEvents(events);
    const transactions = paymentEvents
      .map(mapActivityToTransaction)
      .filter((t): t is NonNullable<typeof t> => t !== null);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate volumes
    let todayVolume = 0;
    let weekVolume = 0;
    let monthVolume = 0;

    // Calculate statistics
    let x402Count = 0;
    let completedCount = 0;
    let failedCount = 0;
    let pendingApprovalCount = 0;
    const merchantStats: Record<string, { count: number; volume: number }> = {};
    const channelStats: Record<string, { count: number; volume: number }> = {};

    transactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      const amount = tx.amount || 0;

      // Volume calculations
      if (txDate >= today) {
        todayVolume += amount;
      }
      if (txDate >= weekAgo) {
        weekVolume += amount;
      }
      if (txDate >= monthAgo) {
        monthVolume += amount;
      }

      // Count by type
      if (tx.x402ProtocolCall) {
        x402Count++;
      }
      if (tx.status === "success") {
        completedCount++;
      } else if (tx.status === "failed") {
        failedCount++;
      }
      if (tx.approvalStatus === "pending") {
        pendingApprovalCount++;
      }

      // Merchant statistics
      if (tx.merchant) {
        if (!merchantStats[tx.merchant]) {
          merchantStats[tx.merchant] = { count: 0, volume: 0 };
        }
        merchantStats[tx.merchant].count++;
        merchantStats[tx.merchant].volume += amount;
      }

      // Channel statistics
      if (tx.channelId) {
        if (!channelStats[tx.channelId]) {
          channelStats[tx.channelId] = { count: 0, volume: 0 };
        }
        channelStats[tx.channelId].count++;
        channelStats[tx.channelId].volume += amount;
      }
    });

    // Calculate rates
    const totalPaymentEvents = transactions.length;
    const successRate = totalPaymentEvents > 0 ? (completedCount / totalPaymentEvents) * 100 : 0;
    const x402UsageRate = totalPaymentEvents > 0 ? (x402Count / totalPaymentEvents) * 100 : 0;

    // Count active channels
    const activeChannels = agents.filter((a) => a.status === "active").length;

    const analytics: PaymentAnalytics = {
      totalVolume: {
        today: todayVolume,
        week: weekVolume,
        month: monthVolume,
      },
      successRate,
      x402UsageRate,
      activeChannels,
      pendingApprovals: pendingApprovalCount,
      transactionsByMerchant: merchantStats,
      transactionsByChannel: channelStats,
      x402Transactions: x402Count,
      completedTransactions: completedCount,
      failedTransactions: failedCount,
    };

    set({
      analytics,
      isLoading: false,
    });
  },
}));
