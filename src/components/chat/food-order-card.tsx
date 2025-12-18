"use client";

import * as React from "react";
import { 
  MapPin, 
  Clock, 
  Star, 
  Utensils, 
  Truck,
  AlertTriangle,
  Wifi,
  Globe,
  Calendar,
  Sparkles,
  History,
  Gift,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FoodOrder } from "@/types";
import { cn } from "@/lib/utils";

interface FoodOrderCardProps {
  foodOrder: FoodOrder;
  className?: string;
}

export function FoodOrderCard({ foodOrder, className }: FoodOrderCardProps) {
  const { restaurant, items, subtotal, deliveryFee, tax, total, estimatedDelivery, executionMethod, status } = foodOrder;

  // Determine order type based on characteristics
  const isScheduledOrder = restaurant.deliveryTime === "Scheduled" || estimatedDelivery.includes("Tomorrow") || estimatedDelivery.includes("PM") || estimatedDelivery.includes("AM");
  const isReorder = restaurant.name === "Ichiran Ramen"; // Reorder scenario
  const isDiscovery = restaurant.cuisine === "Thai Fusion" || restaurant.cuisine === "Healthy & Organic";
  const isFreeDelivery = deliveryFee === 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered":
      case "delivered":
        return "success";
      case "checkout":
        return "warning";
      case "cart":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "searching":
        return "Finding Restaurant";
      case "selecting":
        return isDiscovery ? "New Discovery" : "Selecting Items";
      case "cart":
        return isScheduledOrder ? "Scheduled" : "In Cart";
      case "checkout":
        return "Checkout";
      case "ordered":
        return "Order Placed";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Get order type icon and label
  const getOrderTypeInfo = () => {
    if (isScheduledOrder) {
      return { icon: Calendar, label: "Scheduled Delivery", color: "text-info" };
    }
    if (isDiscovery) {
      return { icon: Sparkles, label: "New Discovery", color: "text-warning" };
    }
    return { icon: History, label: "Quick Reorder", color: "text-accent-primary" };
  };

  const orderTypeInfo = getOrderTypeInfo();

  return (
    <Card className={cn("max-w-md overflow-hidden", className)}>
      {/* Restaurant Header */}
      <div className="relative">
        {restaurant.imageUrl && (
          <div className="h-32 w-full overflow-hidden">
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        
        <div className={cn(
          "p-4",
          restaurant.imageUrl && "absolute bottom-0 left-0 right-0 text-white"
        )}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg">{restaurant.name}</h4>
              <p className={cn(
                "text-sm",
                restaurant.imageUrl ? "text-gray-200" : "text-text-secondary"
              )}>
                {restaurant.cuisine}
              </p>
            </div>
            <Badge variant={getStatusColor(status) as "default" | "success" | "warning" | "error"}>
              {getStatusLabel(status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Order Type Banner */}
      <div className={cn(
        "px-4 py-2 flex items-center gap-2 border-b border-border-subtle",
        isScheduledOrder && "bg-info/10",
        isDiscovery && "bg-warning/10",
        isReorder && !isScheduledOrder && !isDiscovery && "bg-accent-primary/10"
      )}>
        <orderTypeInfo.icon className={cn("h-4 w-4", orderTypeInfo.color)} />
        <span className={cn("text-sm font-medium", orderTypeInfo.color)}>{orderTypeInfo.label}</span>
        {isFreeDelivery && (
          <Badge variant="success" className="text-xs ml-auto">
            <Gift className="h-3 w-3 mr-1" />
            Free Delivery
          </Badge>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-text-secondary">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-text-primary">{restaurant.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <Clock className="h-4 w-4" />
            <span>{isScheduledOrder ? "Pre-order" : restaurant.deliveryTime}</span>
          </div>
          {!isFreeDelivery && (
            <div className="flex items-center gap-1 text-text-secondary">
              <Truck className="h-4 w-4" />
              <span>${restaurant.deliveryFee.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        {/* Execution Method Badge */}
        <div className="mt-2 flex items-center gap-2">
          {executionMethod === "api" ? (
            <Badge variant="info" className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              Using API
            </Badge>
          ) : (
            <Badge variant="warning" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Browser Automation
            </Badge>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <Utensils className="h-4 w-4" />
          <span>Your Order</span>
        </div>
        
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {item.quantity}x {item.name}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              )}
              {item.customizations && item.customizations.length > 0 && (
                <p className="text-xs text-accent-primary mt-0.5">
                  + {item.customizations.join(", ")}
                </p>
              )}
            </div>
            <span className="text-sm text-text-secondary">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="px-4 py-3 bg-bg-secondary border-t border-border-subtle space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Subtotal</span>
          <span className="text-text-primary">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Delivery Fee</span>
          {isFreeDelivery ? (
            <span className="text-success font-medium">FREE</span>
          ) : (
            <span className="text-text-primary">${deliveryFee.toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Tax</span>
          <span className="text-text-primary">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border-subtle">
          <span className="text-text-primary">Total</span>
          <span className="text-accent-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="px-4 py-3 border-t border-border-subtle">
        <div className="flex items-center gap-2 text-sm">
          {isScheduledOrder ? (
            <>
              <Calendar className="h-4 w-4 text-info" />
              <span className="text-text-secondary">Scheduled Delivery:</span>
              <span className="font-medium text-info">{estimatedDelivery}</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-accent-primary" />
              <span className="text-text-secondary">Estimated Delivery:</span>
              <span className="font-medium text-text-primary">{estimatedDelivery}</span>
            </>
          )}
        </div>
      </div>

      {/* Sensitive Steps Warning */}
      <div className="px-4 py-3 bg-warning/10 border-t border-warning/30">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary">
            <span className="font-medium text-warning">Sensitive steps included:</span>
            <span className="ml-1">Login and final checkout will require your approval.</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

