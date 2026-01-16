"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AmountInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSubmit: (amount: number) => Promise<void>;
  isLoading?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export function AmountInputDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  isLoading = false,
  minAmount,
  maxAmount,
}: AmountInputDialogProps) {
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setAmount("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    setError(null);

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (minAmount !== undefined && numAmount < minAmount) {
      setError(`Minimum amount is ${minAmount}`);
      return;
    }

    if (maxAmount !== undefined && numAmount > maxAmount) {
      setError(`Maximum amount is ${maxAmount}`);
      return;
    }

    try {
      await onSubmit(numAmount);
      onOpenChange(false);
    } catch (error) {
      console.error("[AmountInputDialog] Failed to submit:", error);
      setError(
        error instanceof Error ? error.message : "Failed to process request"
      );
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Amount (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                $
              </span>
              <Input
                type="text"
                inputMode="decimal"
                className="pl-7"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSubmit();
                  }
                }}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-error mt-1">{error}</p>
            )}
            {minAmount !== undefined && (
              <p className="text-xs text-text-tertiary">
                Minimum: ${minAmount}
              </p>
            )}
            {maxAmount !== undefined && (
              <p className="text-xs text-text-tertiary">
                Maximum: ${maxAmount}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !amount}>
            {isLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
