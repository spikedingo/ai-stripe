"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PaymentStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function PaymentStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: PaymentStatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-text-tertiary">{title}</p>
            <p className="text-xl font-semibold text-text-primary mt-1">
              {typeof value === "number" ? formatCurrency(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>
            )}
            {trend && (
              <p
                className={`text-xs mt-1 ${
                  trend.isPositive ? "text-success" : "text-error"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
