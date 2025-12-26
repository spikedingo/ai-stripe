"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { Bot, LogIn, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin({
    onComplete: () => {
      router.push("/");
    },
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (ready && authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

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
            <span className="text-2xl font-bold text-text-primary">Payment 402</span>
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
