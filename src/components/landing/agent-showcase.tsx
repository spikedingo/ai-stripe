"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight, Target, Utensils, Plane, DollarSign, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Agent data with features and target pages
const agents = [
  {
    id: "agent_1",
    name: "Deal Hunter",
    avatar: "🎯",
    description: "Monitors prices and automatically purchases when your target price is reached. Set it and forget it.",
    template: "deal_hunter",
    targetPath: "/mock/purchase/command",
    icon: Target,
    features: [
      { icon: DollarSign, text: "Price Monitoring" },
      { icon: Clock, text: "Auto-Purchase" },
      { icon: Shield, text: "Budget Limits" },
    ],
    stats: {
      dailyBudget: 100,
      avgSaved: "15%",
    },
    gradient: "from-orange-500/20 to-red-500/20",
    accentColor: "text-orange-400",
  },
  {
    id: "agent_2",
    name: "Food Runner",
    avatar: "🍜",
    description: "Orders food from your favorite restaurants using natural language. Just tell it what you're craving.",
    template: "food_delivery",
    targetPath: "/mock/purchase/card",
    icon: Utensils,
    features: [
      { icon: Clock, text: "Quick Orders" },
      { icon: DollarSign, text: "Budget Tracking" },
      { icon: Shield, text: "Dietary Preferences" },
    ],
    stats: {
      dailyBudget: 80,
      avgSaved: "10%",
    },
    gradient: "from-green-500/20 to-emerald-500/20",
    accentColor: "text-emerald-400",
  },
  {
    id: "agent_3",
    name: "Travel Buddy",
    avatar: "✈️",
    description: "Books flights and travel arrangements with calendar integration. Your personal travel assistant.",
    template: "travel_booker",
    targetPath: "/mock/purchase/wizard",
    icon: Plane,
    features: [
      { icon: Clock, text: "Flight Monitoring" },
      { icon: DollarSign, text: "Price Alerts" },
      { icon: Shield, text: "Flexible Dates" },
    ],
    stats: {
      dailyBudget: 500,
      avgSaved: "20%",
    },
    gradient: "from-blue-500/20 to-indigo-500/20",
    accentColor: "text-blue-400",
  },
];

export function AgentShowcase() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  const handleTryAgent = (targetPath: string) => {
    if (ready && authenticated) {
      router.push(targetPath);
    } else {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
    }
  };

  return (
    <section id="agents" className="py-24 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            AI Agents
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Meet Your Autonomous Agents
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Pre-configured agents ready to handle your everyday purchases. 
            Each agent has its own wallet, budget limits, and approval workflows.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onTry={() => handleTryAgent(agent.targetPath)}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-text-tertiary mb-4">
            Want to create your own custom agent?
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (ready && authenticated) {
                router.push("/agents");
              } else {
                router.push("/login?redirect=/agents");
              }
            }}
          >
            Create Custom Agent
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

interface AgentCardProps {
  agent: typeof agents[0];
  onTry: () => void;
  index: number;
}

function AgentCard({ agent, onTry, index }: AgentCardProps) {
  const Icon = agent.icon;

  return (
    <div
      className={cn(
        "group relative bg-bg-tertiary rounded-2xl border border-border-subtle overflow-hidden",
        "hover:border-accent-primary/50 transition-all duration-300",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          `bg-gradient-to-br ${agent.gradient}`
        )}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{agent.avatar}</div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {agent.name}
              </h3>
              <p className="text-sm text-text-tertiary">{agent.template}</p>
            </div>
          </div>
          <div className={cn("p-2 rounded-lg bg-bg-hover", agent.accentColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-sm mb-6 min-h-[60px]">
          {agent.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {agent.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <feature.icon className="h-4 w-4 text-text-tertiary" />
              <span className="text-text-secondary">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 py-4 border-t border-border-subtle">
          <div>
            <div className="text-xs text-text-tertiary">Daily Budget</div>
            <div className="text-sm font-medium text-text-primary">
              ${agent.stats.dailyBudget}
            </div>
          </div>
          <div className="w-px h-8 bg-border-subtle" />
          <div>
            <div className="text-xs text-text-tertiary">Avg. Saved</div>
            <div className="text-sm font-medium text-accent-primary">
              {agent.stats.avgSaved}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full group/btn"
          onClick={onTry}
        >
          Try {agent.name}
          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}


