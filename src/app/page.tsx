"use client";

import {
  LandingHeader,
  HeroBanner,
  AgentShowcase,
  PartnersSection,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <LandingHeader />
      <HeroBanner />
      <AgentShowcase />
      <PartnersSection />
      
      {/* Footer */}
      <footer className="py-12 bg-bg-secondary border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent-primary flex items-center justify-center">
                <span className="text-text-inverse font-bold">⚡</span>
              </div>
              <span className="font-semibold text-text-primary">AI Stripe</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <a href="#" className="hover:text-text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-text-primary transition-colors">
                Docs
              </a>
              <a href="#" className="hover:text-text-primary transition-colors">
                Contact
              </a>
            </div>
            
            <div className="text-sm text-text-tertiary">
              © {new Date().getFullYear()} AI Stripe. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
