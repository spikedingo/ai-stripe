"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Sparkles, text: "AI-Powered Agents" },
  { icon: Shield, text: "Secure Transactions" },
  { icon: Zap, text: "Instant Payments" },
];

export function HeroBanner() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  const handleGetStarted = () => {
    if (ready && authenticated) {
      router.push("/chat");
    } else {
      router.push("/register");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-bg-primary">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 via-transparent to-info/10" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-info/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--text-primary) 1px, transparent 1px),
                             linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-8 animate-fade-in">
          <Sparkles className="h-4 w-4 text-accent-primary" />
          <span className="text-sm font-medium text-accent-primary">
            Autonomous AI Payment Agents
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 animate-fade-in-up leading-tight">
          Let AI Handle Your
          <br />
          <span className="gradient-text">Payments & Purchases</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Deploy intelligent agents that monitor prices, manage subscriptions, 
          and make purchases on your behalf with secure on-chain settlements.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Button size="xl" onClick={handleGetStarted} className="group">
            Get Started Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="xl"
            variant="outline"
            onClick={() => {
              const agentsSection = document.querySelector("#agents");
              agentsSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Agents
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary/50 border border-border-subtle"
            >
              <feature.icon className="h-4 w-4 text-accent-primary" />
              <span className="text-sm text-text-secondary">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Stats (Optional) */}
        <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-border-subtle max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div>
            <div className="text-3xl font-bold text-text-primary">$2.5M+</div>
            <div className="text-sm text-text-tertiary mt-1">Processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary">10K+</div>
            <div className="text-sm text-text-tertiary mt-1">Transactions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary">99.9%</div>
            <div className="text-sm text-text-tertiary mt-1">Uptime</div>
          </div>
        </div>
      </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-text-tertiary flex items-start justify-center p-2 mx-auto">
            <div className="w-1 h-2 rounded-full bg-text-tertiary animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

