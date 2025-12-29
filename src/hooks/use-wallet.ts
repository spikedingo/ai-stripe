"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCallback, useMemo } from "react";

/**
 * Custom hook to access and manage the user's embedded wallet.
 * Provides convenient methods for wallet operations.
 */
export function useWallet() {
  const { ready, authenticated, user, createWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  // Find the embedded wallet (created by Privy)
  const embeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
  }, [wallets]);

  // Get the primary wallet (embedded first, then any other)
  const primaryWallet = useMemo(() => {
    return embeddedWallet || wallets[0];
  }, [embeddedWallet, wallets]);

  // Check if user has an embedded wallet
  const hasEmbeddedWallet = useMemo(() => {
    return !!embeddedWallet;
  }, [embeddedWallet]);

  // Create embedded wallet if doesn't exist
  const createEmbeddedWallet = useCallback(async () => {
    if (!authenticated || !user) {
      console.error("[PRIVY_DEBUG] Cannot create wallet: user not authenticated");
      return null;
    }

    if (hasEmbeddedWallet) {
      console.log("[PRIVY_DEBUG] Embedded wallet already exists");
      return embeddedWallet;
    }

    try {
      console.log("[PRIVY_DEBUG] Creating embedded wallet...");
      const wallet = await createWallet();
      console.log("[PRIVY_DEBUG] Embedded wallet created:", wallet.address);
      return wallet;
    } catch (error) {
      console.error("[PRIVY_DEBUG] Failed to create embedded wallet:", error);
      throw error;
    }
  }, [authenticated, user, hasEmbeddedWallet, embeddedWallet, createWallet]);

  // Get wallet address (shortened for display)
  const shortenedAddress = useMemo(() => {
    if (!primaryWallet?.address) return null;
    const addr = primaryWallet.address;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, [primaryWallet?.address]);

  // Get the wallet provider for signing transactions
  const getProvider = useCallback(async () => {
    if (!primaryWallet) {
      console.error("[PRIVY_DEBUG] No wallet available");
      return null;
    }

    try {
      const provider = await primaryWallet.getEthereumProvider();
      return provider;
    } catch (error) {
      console.error("[PRIVY_DEBUG] Failed to get provider:", error);
      return null;
    }
  }, [primaryWallet]);

  return {
    // State
    ready: ready && walletsReady,
    authenticated,
    hasEmbeddedWallet,
    
    // Wallet data
    embeddedWallet,
    primaryWallet,
    wallets,
    address: primaryWallet?.address || null,
    shortenedAddress,
    chainId: primaryWallet?.chainId || null,
    
    // Actions
    createEmbeddedWallet,
    getProvider,
  };
}


