"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";
import { X402Badge } from "./x402-badge";
import type { PaymentTransaction } from "@/lib/payment-mapper";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface TransactionListProps {
  transactions: PaymentTransaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const getStatusIcon = (status: PaymentTransaction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-error" />;
    }
  };

  const getStatusColor = (status: PaymentTransaction["status"]) => {
    switch (status) {
      case "success":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-text-secondary">No transactions found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <Card key={tx.id} className="hover:border-border-default transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(tx.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-text-primary">
                        {tx.description}
                      </h4>
                      {tx.x402ProtocolCall && <X402Badge />}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getStatusColor(tx.status)} className="text-xs">
                        {tx.status}
                      </Badge>
                      {tx.merchant && (
                        <Badge variant="outline" className="text-xs">
                          {tx.merchant}
                        </Badge>
                      )}
                      {tx.paymentChannel && (
                        <Badge variant="outline" className="text-xs">
                          {tx.paymentChannel}
                        </Badge>
                      )}
                      {tx.approvalStatus && (
                        <Badge variant="outline" className="text-xs">
                          Approval: {tx.approvalStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary whitespace-nowrap">
                    {formatRelativeTime(tx.createdAt)}
                  </span>
                </div>

                {/* Metadata */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {tx.amount !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(tx.amount)} {tx.currency}
                    </Badge>
                  )}
                  {tx.txHash && (
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-bg-hover text-xs"
                    >
                      <span className="truncate max-w-[100px] font-mono">
                        {tx.txHash}
                      </span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
