import { create } from "zustand";
import type { Message, ExecutionPlan, ApprovalRequest } from "@/types";
import { generateId } from "@/lib/utils";

interface ChatState {
  messages: Message[];
  currentPlan: ExecutionPlan | null;
  pendingApprovals: ApprovalRequest[];
  isStreaming: boolean;
  isProcessing: boolean;
}

interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setPlan: (plan: ExecutionPlan | null) => void;
  updatePlanStep: (stepId: string, updates: Partial<ExecutionPlan["steps"][0]>) => void;
  addApproval: (approval: ApprovalRequest) => void;
  handleApproval: (approvalId: string, approved: boolean) => Promise<void>;
  clearChat: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [],
  currentPlan: null,
  pendingApprovals: [],
  isStreaming: false,
  isProcessing: false,

  // Actions
  sendMessage: async (content: string) => {
    const { addMessage } = get();

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);

    set({ isProcessing: true, isStreaming: true });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Detect if this is a wishlist/shopping request
    const isShoppingRequest =
      content.toLowerCase().includes("buy") ||
      content.toLowerCase().includes("purchase") ||
      content.toLowerCase().includes("wishlist") ||
      content.toLowerCase().includes("monitor") ||
      content.includes("http");

    if (isShoppingRequest) {
      // Generate a shopping plan
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

      // Create approval request
      const approval: ApprovalRequest = {
        id: generateId(),
        planId: plan.id,
        type: "plan",
        title: "Approve Auto-Purchase Plan",
        description:
          "The agent will monitor the product price and automatically purchase when your target price is reached.",
        status: "pending",
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        createdAt: new Date().toISOString(),
      };

      const { addApproval } = get();
      addApproval(approval);

      // Add assistant response
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
    } else {
      // General response
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content:
          "I'm your AI shopping assistant. I can help you:\n\n• **Monitor product prices** - Paste a product link and set a target price\n• **Auto-purchase items** - Buy automatically when your conditions are met\n• **Track deals** - Get notified when prices drop\n\nTo get started, paste a product URL or tell me what you'd like to buy!",
        status: "sent",
        createdAt: new Date().toISOString(),
      };

      addMessage(assistantMessage);
    }

    set({ isProcessing: false, isStreaming: false });
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessage: (id: string, updates: Partial<Message>) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
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

    // Update approval status
    const newStatus = approved ? "approved" : "rejected";
    const updatedApprovals = pendingApprovals.map((a) =>
      a.id === approvalId
        ? { ...a, status: newStatus as "approved" | "rejected" }
        : a
    );

    set({ pendingApprovals: updatedApprovals });

    if (approved && currentPlan) {
      // Update plan status
      set({
        currentPlan: { ...currentPlan, status: "executing" },
      });

      // Simulate execution
      for (const step of currentPlan.steps) {
        if (step.status === "completed") continue;

        updatePlanStep(step.id, { status: "in_progress" });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        updatePlanStep(step.id, { status: "completed" });
      }

      set({
        currentPlan: { ...currentPlan, status: "completed" },
      });

      // Add completion message
      const completionMessage: Message = {
        id: generateId(),
        role: "assistant",
        content:
          "✅ **Plan Executed Successfully!**\n\nI've set up price monitoring for your item. I'll automatically purchase it when the price drops to your target.\n\nYou can view the monitoring status in your Activity Feed.",
        status: "sent",
        createdAt: new Date().toISOString(),
      };

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

  clearChat: () => {
    set({
      messages: [],
      currentPlan: null,
      pendingApprovals: [],
    });
  },
}));

