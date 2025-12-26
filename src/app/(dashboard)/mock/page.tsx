"use client";

import * as React from "react";
import Link from "next/link";
import {
  Command,
  FormInput,
  CreditCard,
  GitBranch,
  List,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MockDemoCard {
  id: string;
  title: string;
  description: string;
  category: "purchase" | "timeline";
  href: string;
  icon: React.ElementType;
  features: string[];
  recommended?: boolean;
}

const mockDemos: MockDemoCard[] = [
  // Purchase UI Mocks
  {
    id: "command",
    title: "Command Panel",
    description: "Quick command input like Linear/Raycast with ⌘K style modal",
    category: "purchase",
    href: "/mock/purchase/command",
    icon: Command,
    features: ["Keyboard shortcuts", "Quick search", "Natural language input"],
    recommended: true,
  },
  {
    id: "wizard",
    title: "Form Wizard",
    description: "Step-by-step form flow with guided configuration",
    category: "purchase",
    href: "/mock/purchase/wizard",
    icon: FormInput,
    features: ["Multi-step form", "Progress indicator", "Validation feedback"],
  },
  {
    id: "card",
    title: "Card Action",
    description: "Inline purchase panel on Agent cards",
    category: "purchase",
    href: "/mock/purchase/card",
    icon: CreditCard,
    features: ["Agent context", "Quick actions", "Inline expansion"],
  },
  // Timeline Mocks
  {
    id: "vertical",
    title: "Vertical Timeline",
    description: "Classic timeline with nodes showing each step and status",
    category: "timeline",
    href: "/mock/timeline/vertical",
    icon: GitBranch,
    features: ["Real-time updates", "Step details", "Duration tracking"],
    recommended: true,
  },
  {
    id: "stepper",
    title: "Horizontal Stepper",
    description: "Compact progress bar with current step highlighted",
    category: "timeline",
    href: "/mock/timeline/stepper",
    icon: List,
    features: ["Compact view", "Progress overview", "Log panel"],
  },
  {
    id: "expandable",
    title: "Expandable Cards",
    description: "Accordion-style cards with collapsible details",
    category: "timeline",
    href: "/mock/timeline/expandable",
    icon: ChevronDown,
    features: ["Collapse/Expand", "Summary view", "Detail on demand"],
  },
];

export default function MockPage() {
  const purchaseDemos = mockDemos.filter((d) => d.category === "purchase");
  const timelineDemos = mockDemos.filter((d) => d.category === "timeline");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-3">
            UI Pattern Exploration
          </h2>
          <p className="text-text-secondary">
            Explore different UI patterns for purchase triggering and thinking chain visualization.
            Each demo showcases a different approach to the same functionality.
          </p>
        </div>

        {/* Purchase UI Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Purchase Trigger UI
            </h3>
            <Badge variant="info">3 Options</Badge>
          </div>
          <p className="text-text-secondary text-sm mb-4">
            Different ways to trigger a new purchase flow with an AI agent.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {purchaseDemos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} />
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Thinking Chain Display
            </h3>
            <Badge variant="info">3 Options</Badge>
          </div>
          <p className="text-text-secondary text-sm mb-4">
            Different ways to visualize the agent&apos;s decision-making process during a purchase.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {timelineDemos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} />
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-sm text-text-tertiary py-4 border-t border-border-subtle">
          <p>
            These are mock demonstrations for UI exploration. 
            Data shown is simulated for demo purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoCard({ demo }: { demo: MockDemoCard }) {
  const Icon = demo.icon;

  return (
    <Link href={demo.href}>
      <Card className="h-full hover:border-accent-primary transition-all cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-tertiary group-hover:bg-accent-primary/10 transition-colors">
              <Icon className="h-5 w-5 text-text-secondary group-hover:text-accent-primary transition-colors" />
            </div>
            {demo.recommended && (
              <Badge variant="success" className="text-xs">
                Recommended
              </Badge>
            )}
          </div>
          <CardTitle className="text-base mt-3 flex items-center gap-2">
            {demo.title}
            <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardTitle>
          <CardDescription className="text-sm">
            {demo.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {demo.features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-normal">
                {feature}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

