"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { Bot, UserPlus, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin({
    onComplete: () => {
      router.push("/dashboard");
    },
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
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
            <span className="text-2xl font-bold text-text-primary">AI Agent</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>Get started with AI-powered shopping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Register Button - uses same Privy login flow */}
            <Button
              onClick={() => login()}
              className="w-full h-12 text-base"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Create Account
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-bg-tertiary px-2 text-text-tertiary">
                  Sign up with
                </span>
              </div>
            </div>

            {/* Login Methods Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg-secondary">
                <Mail className="h-5 w-5 text-accent-primary" />
                <span className="text-xs text-text-secondary">Email</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg-secondary">
                <svg className="h-5 w-5 text-accent-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-xs text-text-secondary">Google</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg-secondary">
                <MessageSquare className="h-5 w-5 text-accent-primary" />
                <span className="text-xs text-text-secondary">Twitter</span>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-text-tertiary text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              Your account will be secured with Privy.
            </p>

            {/* Login Link */}
            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-accent-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
