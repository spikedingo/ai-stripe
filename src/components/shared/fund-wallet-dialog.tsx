"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FundWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  amount?: string;
}

export function FundWalletDialog({
  open,
  onOpenChange,
  walletAddress,
  amount,
}: FundWalletDialogProps) {
  const [copied, setCopied] = React.useState(false);

  // Generate QR code data (use wallet address directly for better compatibility)
  const qrData = React.useMemo(() => {
    // Use wallet address directly - most wallets can scan and recognize it
    // Alternative: ethereum:address?value=amountETH (some wallets support this)
    return walletAddress;
  }, [walletAddress]);

  const copyAddress = React.useCallback(() => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  const copyQRData = React.useCallback(() => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [qrData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fund Wallet</DialogTitle>
          <DialogDescription>
            Scan the QR code or copy the address to send ETH to your wallet on Base Sepolia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={qrData}
              size={256}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Wallet Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle">
                <span className="font-mono text-sm text-text-primary truncate">
                  {walletAddress}
                </span>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={copyAddress}
                title="Copy address"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Amount Info */}
          {amount && (
            <div className="p-3 rounded-lg bg-bg-secondary">
              <p className="text-sm text-text-secondary">
                Recommended amount: <span className="font-medium text-text-primary">{amount} ETH</span>
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 rounded-lg bg-bg-tertiary">
            <p className="text-xs text-text-tertiary">
              <strong className="text-text-secondary">Instructions:</strong>
              <br />
              1. Open your wallet app (MetaMask, Coinbase Wallet, etc.)
              <br />
              2. Scan the QR code or paste the address
              <br />
              3. Send ETH on Base Sepolia network
              <br />
              4. Wait for the transaction to confirm
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
