"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { User, CreditCard, Shield, Bell } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore, useBalanceStore } from "@/stores";
import { formatUSDC, formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const { user } = useAuthStore();
  const { balance, transactions, addFunds, isLoading } = useBalanceStore();

  const [showAddFunds, setShowAddFunds] = React.useState(false);
  const [fundAmount, setFundAmount] = React.useState("50");

  const handleAddFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (amount > 0) {
      await addFunds(amount);
      setShowAddFunds(false);
      setFundAmount("50");
    }
  };

  const depositTransactions = transactions.filter((t) => t.type === "deposit");

  return (
    <>
      <Header title="Settings" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue={defaultTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar fallback={user?.name?.[0] || "U"} size="xl" />
                    <div>
                      <Button variant="secondary" size="sm">
                        Change Avatar
                      </Button>
                      <p className="text-xs text-text-tertiary mt-1">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">
                      Full Name
                    </label>
                    <Input defaultValue={user?.name || ""} />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">
                      Email Address
                    </label>
                    <Input defaultValue={user?.email || ""} disabled />
                    <p className="text-xs text-text-tertiary">
                      Contact support to change your email
                    </p>
                  </div>

                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              {/* Balance Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Account Balance</CardTitle>
                      <CardDescription>
                        Your available USDC balance for agent transactions
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowAddFunds(true)}>Add Funds</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-text-primary">
                      {formatUSDC(balance.available)}
                    </span>
                    <span className="text-text-tertiary">available</span>
                  </div>
                  {balance.pending > 0 && (
                    <p className="text-sm text-text-secondary mt-2">
                      + {formatUSDC(balance.pending)} pending
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Deposit History */}
              <Card>
                <CardHeader>
                  <CardTitle>Deposit History</CardTitle>
                  <CardDescription>Your recent fund additions</CardDescription>
                </CardHeader>
                <CardContent>
                  {depositTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {depositTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0"
                        >
                          <div>
                            <p className="font-medium text-text-primary">
                              {tx.description}
                            </p>
                            <p className="text-sm text-text-tertiary">
                              {formatDate(tx.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-success">
                              +${tx.amount.toFixed(2)}
                            </p>
                            <Badge variant="success" className="text-xs">
                              {tx.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-text-tertiary">
                      No deposits yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Auto-Reload Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Reload</CardTitle>
                  <CardDescription>
                    Automatically add funds when your balance is low
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary">
                    <div>
                      <p className="font-medium text-text-primary">Enable Auto-Reload</p>
                      <p className="text-sm text-text-tertiary">
                        Add $50 when balance falls below $10
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Change Password */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-text-primary">Change Password</h3>
                    <div className="space-y-3">
                      <Input type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" />
                      <Input type="password" placeholder="Confirm new password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>

                  <hr className="border-border-subtle" />

                  {/* Two-Factor */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-text-tertiary">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <hr className="border-border-subtle" />

                  {/* Sessions */}
                  <div>
                    <p className="font-medium text-text-primary mb-3">Active Sessions</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            Current Session
                          </p>
                          <p className="text-xs text-text-tertiary">
                            Chrome on macOS • Last active just now
                          </p>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Transaction Alerts",
                      description: "Get notified when agents make purchases",
                    },
                    {
                      title: "Price Alerts",
                      description: "Notifications when watched items drop in price",
                    },
                    {
                      title: "Approval Requests",
                      description: "Alerts when agents need your approval",
                    },
                    {
                      title: "Low Balance",
                      description: "Warning when your balance is running low",
                    },
                    {
                      title: "Weekly Summary",
                      description: "Weekly digest of agent activity",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary"
                    >
                      <div>
                        <p className="font-medium text-text-primary">{item.title}</p>
                        <p className="text-sm text-text-tertiary">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={index < 3}
                        />
                        <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Add USDC to your account balance. This is a demo - no real payment required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-2">
              {["25", "50", "100", "200"].map((amount) => (
                <Button
                  key={amount}
                  variant={fundAmount === amount ? "default" : "secondary"}
                  onClick={() => setFundAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  $
                </span>
                <Input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="pl-7"
                  min="1"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-4 rounded-lg bg-bg-secondary">
              <p className="text-sm text-text-secondary mb-2">Payment Method</p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 rounded bg-[#635BFF] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">stripe</span>
                </div>
                <span className="text-text-primary">Demo Card •••• 4242</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddFunds(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFunds} disabled={isLoading}>
              {isLoading ? "Processing..." : `Add $${fundAmount}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

