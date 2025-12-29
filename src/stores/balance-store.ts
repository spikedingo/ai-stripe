import { create } from "zustand";
import type { Balance, Transaction } from "@/types";

interface BalanceState {
  balance: Balance;
  transactions: Transaction[];
  isLoading: boolean;
}

interface BalanceActions {
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  deductFunds: (amount: number, description: string, agentId?: string) => Promise<void>;
}

type BalanceStore = BalanceState & BalanceActions;

// Mock transactions
const mockTransactions: Transaction[] = [
  {
    id: "tx_1",
    type: "deposit",
    amount: 100,
    currency: "USDC",
    status: "completed",
    description: "Initial deposit via Stripe",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "tx_2",
    type: "payment",
    amount: 15.99,
    currency: "USDC",
    status: "completed",
    description: "Amazon - Product purchase",
    agentId: "agent_1",
    merchantName: "Amazon",
    txHash: "0x1234...5678",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "tx_3",
    type: "payment",
    amount: 0.05,
    currency: "USDC",
    status: "completed",
    description: "x402 - Price check API call",
    agentId: "agent_1",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const useBalanceStore = create<BalanceStore>((set, get) => ({
  // Initial state
  balance: {
    available: 84.96,
    pending: 0,
    currency: "USDC",
  },
  transactions: [],
  isLoading: false,

  // Actions
  fetchBalance: async () => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In real app, fetch from API
    set({ isLoading: false });
  },

  fetchTransactions: async () => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    set({
      transactions: mockTransactions,
      isLoading: false,
    });
  },

  addFunds: async (amount: number) => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { balance, transactions } = get();

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: "deposit",
      amount,
      currency: "USDC",
      status: "completed",
      description: "Deposit via Stripe",
      createdAt: new Date().toISOString(),
    };

    set({
      balance: {
        ...balance,
        available: balance.available + amount,
      },
      transactions: [newTransaction, ...transactions],
      isLoading: false,
    });
  },

  deductFunds: async (amount: number, description: string, agentId?: string) => {
    const { balance, transactions } = get();

    if (balance.available < amount) {
      throw new Error("Insufficient balance");
    }

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: "payment",
      amount,
      currency: "USDC",
      status: "completed",
      description,
      agentId,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    set({
      balance: {
        ...balance,
        available: balance.available - amount,
      },
      transactions: [newTransaction, ...transactions],
    });
  },
}));


