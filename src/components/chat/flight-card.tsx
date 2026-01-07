"use client";

import * as React from "react";
import { 
  Plane, 
  Clock, 
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle,
  Circle,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FlightBooking, FlightOption } from "@/types";
import { cn } from "@/lib/utils";

interface FlightCardProps {
  flightBooking: FlightBooking;
  onSelectFlight?: (flightId: string) => void;
  className?: string;
}

export function FlightCard({ flightBooking, onSelectFlight, className }: FlightCardProps) {
  const { 
    flightOptions, 
    selectedFlightId, 
    calendarAvailability, 
    toolCallsCost, 
    status,
    tripType,
    passengers,
  } = flightBooking;

  const [localSelectedId, setLocalSelectedId] = React.useState<string | null>(selectedFlightId || null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "booking":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "searching":
        return "Searching";
      case "selecting":
        return "Select Flight";
      case "booking":
        return "Booking...";
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleSelect = (flightId: string) => {
    setLocalSelectedId(flightId);
    onSelectFlight?.(flightId);
  };

  return (
    <Card className={cn("max-w-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-bg-secondary border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-accent-primary" />
            <h4 className="font-semibold text-text-primary">Flight Options</h4>
          </div>
          <Badge variant={getStatusColor(status) as "default" | "success" | "warning" | "error"}>
            {getStatusLabel(status)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{passengers} passenger{passengers > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{tripType === "round_trip" ? "Round Trip" : "One Way"}</span>
          </div>
        </div>
      </div>

      {/* Calendar Availability */}
      {calendarAvailability && (
        <div className="px-4 py-3 border-b border-border-subtle bg-info/5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-info" />
            <span className="font-medium text-text-primary">Calendar Check</span>
            <Badge variant="info" className="text-xs ml-auto">x402: $0.01</Badge>
          </div>
          <div className="mt-2 text-xs text-text-secondary">
            <p>✓ Available: {calendarAvailability.availableDates.join(', ')}</p>
            {calendarAvailability.conflictingEvents.length > 0 && (
              <p className="text-warning">⚠ Conflicts: {calendarAvailability.conflictingEvents.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Flight Options */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text-primary">
            {flightOptions.length} flights found
          </span>
          <Badge variant="info" className="text-xs">x402: $0.05</Badge>
        </div>

        <div className="space-y-3">
          {flightOptions.map((flight) => (
            <FlightOptionCard
              key={flight.id}
              flight={flight}
              isSelected={localSelectedId === flight.id}
              onSelect={() => handleSelect(flight.id)}
            />
          ))}
        </div>
      </div>

      {/* Tool Calls Cost Summary */}
      <div className="px-4 py-3 bg-bg-secondary border-t border-border-subtle">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent-primary" />
            <span className="text-text-secondary">x402 Tool Costs</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-tertiary">
              Calendar + Search + Booking
            </div>
            <div className="font-semibold text-accent-primary">
              ${toolCallsCost.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Flight Summary */}
      {localSelectedId && (
        <div className="px-4 py-3 border-t border-accent-primary/30 bg-accent-primary/5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-accent-primary" />
            <span className="text-text-primary">
              Flight selected: {flightOptions.find(f => f.id === localSelectedId)?.flightNumber}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Approve the plan above to proceed with booking
          </p>
        </div>
      )}
    </Card>
  );
}

// Individual Flight Option Card
interface FlightOptionCardProps {
  flight: FlightOption;
  isSelected: boolean;
  onSelect: () => void;
}

function FlightOptionCard({ flight, isSelected, onSelect }: FlightOptionCardProps) {
  return (
    <div 
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        isSelected 
          ? "border-accent-primary bg-accent-primary/5" 
          : "border-border-subtle hover:border-border-default hover:bg-bg-secondary"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-bg-tertiary flex items-center justify-center overflow-hidden">
            {flight.airlineLogo ? (
              <img 
                src={flight.airlineLogo} 
                alt={flight.airline}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <Plane className="h-4 w-4 text-text-secondary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{flight.airline}</p>
            <p className="text-xs text-text-tertiary">{flight.flightNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-accent-primary">
            ${flight.price.toFixed(0)}
          </p>
          <p className="text-xs text-text-tertiary">{flight.class}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Departure */}
        <div className="text-center">
          <p className="text-lg font-semibold text-text-primary">{flight.departure.time}</p>
          <p className="text-xs text-text-secondary">{flight.departure.airport}</p>
        </div>

        {/* Flight Path */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-px bg-border-default relative">
            <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary" />
          </div>
        </div>

        {/* Arrival */}
        <div className="text-center">
          <p className="text-lg font-semibold text-text-primary">{flight.arrival.time}</p>
          <p className="text-xs text-text-secondary">{flight.arrival.airport}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-text-tertiary">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{flight.duration}</span>
          </div>
          <span className={cn(
            flight.stops === 0 ? "text-success" : "text-text-secondary"
          )}>
            {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
          </span>
        </div>
        <span className={cn(
          flight.seatsAvailable <= 5 ? "text-warning" : "text-text-tertiary"
        )}>
          {flight.seatsAvailable} seats left
        </span>
      </div>

      {/* Selection Indicator */}
      <div className="flex items-center justify-end mt-2">
        {isSelected ? (
          <CheckCircle className="h-5 w-5 text-accent-primary" />
        ) : (
          <Circle className="h-5 w-5 text-text-tertiary" />
        )}
      </div>
    </div>
  );
}






