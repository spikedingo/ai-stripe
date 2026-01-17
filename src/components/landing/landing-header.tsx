"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#agents", label: "Agents" },
  { href: "#partners", label: "Partners" },
];

export function LandingHeader() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    // Smooth scroll to section
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-bg-primary/80 backdrop-blur-lg border-b border-border-subtle"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-primary group-hover:bg-accent-hover transition-colors">
              <Zap className="h-5 w-5 text-text-inverse" />
            </div>
            <span className="text-xl font-semibold text-text-primary">
              AI Stripe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {ready && authenticated ? (
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            ) : (
              <Button onClick={() => router.push("/register")}>
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bg-primary/95 backdrop-blur-lg border-b border-border-subtle">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left text-text-secondary hover:text-text-primary transition-colors py-2"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-border-subtle flex flex-col gap-2">
              {ready && authenticated ? (
                <Button
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => router.push("/register")}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

