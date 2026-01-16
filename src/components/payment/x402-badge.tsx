"use client";

import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface X402BadgeProps {
  className?: string;
}

export function X402Badge({ className }: X402BadgeProps) {
  return (
    <Badge variant="outline" className={className}>
      <Zap className="h-3 w-3 mr-1 text-accent-primary" />
      <span className="text-xs">x402</span>
    </Badge>
  );
}
