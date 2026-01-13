"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";

// API base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://p402.crestal.dev/";

// Type definition for wallet response
export interface UserWalletResponse {
  address: string;
  network_id: string;
  usdc_balance: string;
  [key: string]: unknown;
}

/**
 * Hook to fetch user wallet address from the API
 * Automatically fetches when user is authenticated
 * Uses React Query for caching and automatic refetching
 */
export function useUserWallet() {
  const { getAccessToken, authenticated, ready } = usePrivy();

  return useQuery({
    queryKey: ["userWallet"],
    queryFn: async () => {
      if (!authenticated) {
        throw new Error("User not authenticated");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get access token");
      }

      console.log("[WALLET_API] Fetching user wallet address...");
      
      const response = await axios.get<UserWalletResponse>(
        `${API_BASE_URL}user/wallet`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[WALLET_API] Wallet address fetched:", response.data.address);
      return response.data;
    },
    enabled: ready && authenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
