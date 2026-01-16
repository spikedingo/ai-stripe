"use client";

import * as React from "react";
import Link from "next/link";
import { Settings, Wallet, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { X402Badge } from "./x402-badge";
import type { PaymentChannel } from "@/lib/payment-mapper";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface PaymentChannelCardProps {
  channel: PaymentChannel;
}

export function PaymentChannelCard({ channel }: PaymentChannelCardProps) {
  const getStatusColor = (status: PaymentChannel["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "stopped":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              fallback={channel.name[0]}
              size="lg"
              className="bg-accent-primary/10 text-accent-primary"
            />
            <div>
              <CardTitle className="text-base">{channel.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusColor(channel.status)}>
                  {channel.status}
                </Badge>
                {channel.x402Integration && <X402Badge />}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {channel.description}
        </p>

        {/* Payment Configuration */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Payment Rules</span>
            <span className="text-text-primary font-medium">
              {channel.paymentRules.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Merchant Support</span>
            <span className="text-text-primary font-medium">
              {channel.merchantSupport.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Max Transaction</span>
            <span className="text-text-primary">
              {formatCurrency(channel.transactionLimits.maxAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Approval Threshold</span>
            <span className="text-text-primary">
              {formatCurrency(channel.transactionLimits.requireApprovalAbove)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Weekly Limit</span>
            <span className="text-text-primary">
              {formatCurrency(channel.transactionLimits.weeklyLimit)}
            </span>
          </div>
        </div>

        {channel.lastActiveAt && (
          <div className="flex items-center gap-1 text-text-tertiary text-xs mb-4">
            <TrendingUp className="h-3 w-3" />
            <span>Active {formatRelativeTime(channel.lastActiveAt)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link href={`/payment-management/channels/${channel.id}`}>
            <Button variant="secondary" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
