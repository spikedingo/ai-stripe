"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { Bot, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Separate component for the login content that uses useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, authenticated } = usePrivy();
  
  // Get redirect URL from query params, default to /chat
  const redirectUrl = searchParams.get("redirect") || "/chat";

  const { login } = useLogin({
    onComplete: () => {
      router.push(redirectUrl);
    },
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (ready && authenticated) {
      router.push(redirectUrl);
    }
  }, [ready, authenticated, router, redirectUrl]);

  // Show loading while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary">
              <Bot className="h-7 w-7 text-text-inverse" />
            </div>
            <span className="text-2xl font-bold text-text-primary">AI Stripe</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to continue to your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Login Button */}
            <Button
              onClick={() => login()}
              className="w-full h-12 text-base"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>

            {/* Info Text */}
            <p className="text-xs text-text-tertiary text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your account will be secured with Privy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main page component wrapped with Suspense
export default function LoginPage() {
  return (
    <React.Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
