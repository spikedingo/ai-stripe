"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Partners data based on mockSaaSTools categories
const partners = [
  // SaaS Partners
  { name: "Figma", logo: "🎨", category: "Design" },
  { name: "Notion", logo: "📝", category: "Productivity" },
  { name: "Slack", logo: "💬", category: "Communication" },
  { name: "Linear", logo: "📋", category: "Project Management" },
  // API Partners
  { name: "OpenAI", logo: "🧠", category: "AI" },
  { name: "Anthropic", logo: "🤖", category: "AI" },
  { name: "Twilio", logo: "📱", category: "Communication" },
  // Cloud Partners
  { name: "Vercel", logo: "▲", category: "Cloud" },
  { name: "AWS", logo: "☁️", category: "Cloud" },
  { name: "Cloudflare", logo: "🔶", category: "Security" },
  // E-commerce Partners
  { name: "Amazon", logo: "📦", category: "E-commerce" },
  { name: "Walmart", logo: "🏪", category: "Retail" },
  { name: "DoorDash", logo: "🚗", category: "Delivery" },
  { name: "Uber Eats", logo: "🍔", category: "Delivery" },
];

export function PartnersSection() {
  return (
    <section id="partners" className="py-24 bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Integrations
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Works With Your Favorite Services
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Our agents integrate seamlessly with leading platforms for shopping, 
            subscriptions, and services.
          </p>
        </div>

        {/* Partners Marquee - First Row */}
        <div className="relative mb-8">
          {/* Gradient overlays for seamless loop effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-10" />
          
          <div className="flex animate-marquee">
            {/* Duplicate partners for seamless loop */}
            {[...partners, ...partners].map((partner, index) => (
              <PartnerCard key={`${partner.name}-${index}`} partner={partner} />
            ))}
          </div>
        </div>

        {/* Partners Marquee - Second Row (Reverse) */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-10" />
          
          <div className="flex animate-marquee-reverse">
            {/* Duplicate and reverse order */}
            {[...partners.reverse(), ...partners].map((partner, index) => (
              <PartnerCard key={`${partner.name}-rev-${index}`} partner={partner} />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mt-16">
          {["E-commerce", "AI", "Cloud", "Delivery", "Productivity", "Design"].map(
            (category) => (
              <div
                key={category}
                className="px-4 py-2 rounded-full bg-bg-tertiary border border-border-subtle text-text-secondary text-sm"
              >
                {category}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

interface PartnerCardProps {
  partner: typeof partners[0];
}

function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 mx-4 px-6 py-4 rounded-xl",
        "bg-bg-tertiary border border-border-subtle",
        "hover:border-accent-primary/30 transition-colors",
        "flex items-center gap-3 min-w-[180px]"
      )}
    >
      <span className="text-2xl">{partner.logo}</span>
      <div>
        <div className="font-medium text-text-primary">{partner.name}</div>
        <div className="text-xs text-text-tertiary">{partner.category}</div>
      </div>
    </div>
  );
}

