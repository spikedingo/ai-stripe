import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User as PrivyUser, ConnectedWallet } from "@privy-io/react-auth";
import type { User, AuthState, WalletInfo } from "@/types";

interface AuthActions {
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  // Sync user from Privy authentication
  syncPrivyUser: (privyUser: PrivyUser | null, wallets?: ConnectedWallet[]) => void;
  // Update wallet info separately
  updateWallet: (wallet: WalletInfo | undefined) => void;
}

type AuthStore = AuthState & AuthActions;

// Helper to extract wallet info from Privy connected wallets
function extractWalletInfo(wallets: ConnectedWallet[]): WalletInfo | undefined {
  // Prioritize embedded wallet, then other wallets
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const wallet = embeddedWallet || wallets[0];

  if (!wallet) return undefined;

  // Parse chainId from CAIP format (e.g., "eip155:1" -> 1)
  let chainId = 1;
  if (wallet.chainId) {
    const parts = wallet.chainId.split(":");
    chainId = parts.length > 1 ? Number(parts[1]) : Number(wallet.chainId);
  }

  return {
    address: wallet.address,
    chainId,
    chainType: "ethereum", // Default to ethereum for now
    walletClientType: wallet.walletClientType as WalletInfo["walletClientType"],
    isEmbedded: wallet.walletClientType === "privy",
  };
}

// Helper to extract user info from Privy user
function extractUserFromPrivy(privyUser: PrivyUser, wallets?: ConnectedWallet[]): User {
  const email = privyUser.email?.address || privyUser.google?.email || privyUser.twitter?.username || "";
  const name = privyUser.google?.name || privyUser.twitter?.name || email.split("@")[0] || "User";
  // Get avatar from available linked accounts
  const googleAccount = privyUser.google as { picture?: string } | undefined;
  const avatar = googleAccount?.picture || privyUser.twitter?.profilePictureUrl || undefined;

  return {
    id: privyUser.id,
    email,
    name,
    avatar,
    wallet: wallets ? extractWalletInfo(wallets) : undefined,
    createdAt: new Date(privyUser.createdAt).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true until Privy initializes

      // Actions
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Sync user from Privy - called when Privy auth state changes
      syncPrivyUser: (privyUser, wallets) => {
        if (privyUser) {
          const user = extractUserFromPrivy(privyUser, wallets);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Update wallet info separately (useful when wallet connects after login)
      updateWallet: (wallet) => {
        set((state) => ({
          user: state.user ? { ...state.user, wallet } : null,
        }));
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

