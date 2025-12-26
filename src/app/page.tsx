"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    if (!ready) return;
    
    // Redirect based on Privy auth state
    if (authenticated) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }, [ready, authenticated, router]);

  // Show loading while redirecting
  return (
    <div className="flex h-screen items-center justify-center bg-bg-primary">
      <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full" />
    </div>
  );
}
