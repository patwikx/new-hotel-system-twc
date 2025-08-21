"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Star, Shield } from "lucide-react"
import { RoomData } from "../[roomId]/page"
import { Input } from "@/components/ui/input"


interface RoomBookingProps {
  room: RoomData
}

export function RoomBooking({ room }: RoomBookingProps) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  if (!room) return null;

  // Calculates the number of nights between two dates
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const nights = calculateNights();
  // Uses the correct 'baseRate' field from your schema
  const subtotal = nights * room.baseRate;
  const taxes = subtotal * 0.12; // Example tax rate
  const total = subtotal + taxes;

  const handleBooking = async () => {
    setIsLoading(true);
    // In a real application, this would redirect to a checkout page or call a booking API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert(`Booking for ${nights} nights confirmed! Total: ₱${total.toLocaleString()}`);
  }
  
  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">
            ₱{room.baseRate.toLocaleString()}
            <span className="text-base font-normal text-muted-foreground"> / night</span>
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-slate-700">4.8</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Check-in</label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg"
              min={today}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Check-out</label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg"
              min={checkIn || today}
              disabled={!checkIn}
            />
          </div>
        </div>

        {/* Guest Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Guests</label>
          <Input
            type="number"
            min="1"
            // Uses the correct 'maxOccupancy' field from your schema
            max={room.maxOccupancy}
            value={guests}
            onChange={(e) => setGuests(Number.parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
          <p className="text-xs text-muted-foreground mt-1">Maximum {room.maxOccupancy} guests</p>
        </div>

        {/* Price Breakdown */}
        {nights > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">₱{room.baseRate.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
              <span className="text-foreground">₱{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes & fees</span>
              <span className="text-foreground">₱{taxes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-3 border-t">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">₱{total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleBooking}
          disabled={nights === 0 || isLoading}
          className="w-full text-lg py-6"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Reserving...
            </div>
          ) : (
            <>
              <Calendar className="h-5 w-5 mr-2" />
              {nights > 0 ? `Reserve for ₱${total.toLocaleString()}` : "Select Dates"}
            </>
          )}
        </Button>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Free cancellation before check-in</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}