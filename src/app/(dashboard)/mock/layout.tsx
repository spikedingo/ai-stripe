"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRootMock = pathname === "/mock";

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Mock Layout Header */}
      <header className="flex-shrink-0 flex h-14 items-center justify-between border-b border-border-subtle bg-bg-primary px-4">
        <div className="flex items-center gap-3">
          {!isRootMock && (
            <Link href="/mock">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              "bg-warning/10"
            )}>
              <FlaskConical className="h-4 w-4 text-warning" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Mock Demos</h1>
              {!isRootMock && (
                <p className="text-xs text-text-tertiary">Explore different UI patterns</p>
              )}
            </div>
          </div>
        </div>
        
        {!isRootMock && (
          <Link href="/mock">
            <Button variant="secondary" size="sm">
              View All Demos
            </Button>
          </Link>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}

