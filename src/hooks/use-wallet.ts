"use client";

import { usePrivy, useWallets, useFundWallet } from "@privy-io/react-auth";
import { useCallback, useMemo, useState } from "react";
import { baseSepolia } from "viem/chains";
import { useUserWallet } from "./use-user-wallet";

/**
 * Custom hook to access and manage the user's embedded wallet.
 * Provides convenient methods for wallet operations.
 */
export function useWallet() {
  const { ready, authenticated, user, createWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { fundWallet } = useFundWallet();
  const { data: userWalletData } = useUserWallet();
  const [showQRDialog, setShowQRDialog] = useState(false);

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
  }, [primaryWallet]);

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

  // Check if current chain is baseSepolia
  const isBaseSepolia = useMemo(() => {
    const walletChainId = primaryWallet?.chainId;
    if (!walletChainId) return false;
    
    // Handle both string (eip155:84532) and number (84532) formats
    const chainIdStr = String(walletChainId);
    const chainIdNum = typeof walletChainId === "number" 
      ? walletChainId 
      : parseInt(chainIdStr.split(":")[1] || chainIdStr, 10);
    
    return chainIdNum === baseSepolia.id;
  }, [primaryWallet?.chainId]);

  // Fund wallet using Privy (for non-baseSepolia chains)
  const fundWalletWithPrivy = useCallback(
    async (amount?: string) => {
      // Use address from API (user wallet) as primary source, fallback to primaryWallet address
      const walletAddress = userWalletData?.address || primaryWallet?.address;
      
      if (!walletAddress) {
        console.error("[PRIVY_DEBUG] Cannot fund wallet: no address");
        return;
      }

      try {
        // Log chain information for debugging
        const walletChainId = primaryWallet?.chainId;
        console.log("[PRIVY_DEBUG] Opening Privy fund wallet UI...", { 
          walletAddress, 
          baseSepoliaId: baseSepolia.id,
          baseSepoliaName: baseSepolia.name,
          walletChainId,
          walletChainIdString: walletChainId ? String(walletChainId) : "null"
        });
        
        // Privy may use wallet's current chainId if not explicitly provided
        // Explicitly pass baseSepolia chain object to override wallet's chainId
        // This ensures Privy uses baseSepolia (84532) instead of wallet's current chain (may be 1)
        // Reference: crestal-dapp-frontend/components/Popups/TopupPopup.tsx
        // @ts-expect-error - Privy fundWallet accepts 2 parameters (address, options) but types may be incorrect
        await fundWallet(walletAddress as `0x${string}`, {
          chain: baseSepolia,
          amount: amount || "0.1",
          asset: "native-currency",
          card: {
            /** The preferred card onramp for funding */
            preferredProvider: "moonpay",
          },
        });
      } catch (error) {
        console.error("[PRIVY_DEBUG] Failed to fund wallet:", error);
        throw error;
      }
    },
    [fundWallet, userWalletData, primaryWallet]
  );

  // Unified fund wallet method - detects chain and uses appropriate method
  const fundWalletUnified = useCallback(
    async (amount?: string) => {
      const walletAddress = userWalletData?.address || primaryWallet?.address;
      
      if (!walletAddress) {
        console.error("[PRIVY_DEBUG] Cannot fund wallet: no address");
        return;
      }

      // If on baseSepolia, show QR code dialog instead of using Privy fundWallet
      if (isBaseSepolia) {
        console.log("[PRIVY_DEBUG] On Base Sepolia, showing QR code dialog");
        setShowQRDialog(true);
        return;
      }

      // For other chains, use Privy fundWallet
      console.log("[PRIVY_DEBUG] Not on Base Sepolia, using Privy fundWallet");
      await fundWalletWithPrivy(amount);
    },
    [isBaseSepolia, userWalletData, primaryWallet, fundWalletWithPrivy]
  );

  return {
    // State
    ready: ready && walletsReady,
    authenticated,
    hasEmbeddedWallet,
    isBaseSepolia,
    showQRDialog,
    setShowQRDialog,
    
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
    fundWallet: fundWalletUnified,
    // Expose individual methods for advanced usage
    fundWalletWithPrivy,
  };
}






