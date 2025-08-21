"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Star, Bed, Utensils, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"

// This interface now matches the BusinessUnit model from your Prisma schema
interface Hotel {
  id: string
  displayName: string
  description: string | null
  city: string
  logo: string | null
  _count: {
    roomTypes: number
    guests: number
  }
}

interface FeaturesSectionProps {
  // The component expects an array of hotels as a prop
  hotels: Hotel[]
}

export function FeaturesSection({ hotels = [] }: FeaturesSectionProps) {
  // REMOVED: All internal useState and useEffect hooks for data fetching are gone.
  // This is now a simple component that just renders the props it receives.

  if (hotels.length === 0) return null

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="mb-4">
            <Badge variant="outline" className="px-4 py-2 text-primary border-primary/30 bg-primary/10">
              Our Hotel Locations
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4 leading-tight">
            Luxury Hotels Across
            <span className="block text-primary">Premium Destinations</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Experience exceptional hospitality at our {hotels.length} carefully selected locations, each offering unique
            charm and world-class amenities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hotels.map((hotel, index) => (
            <Card
              key={hotel.id}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2 overflow-hidden"
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={hotel.logo || `/placeholder.svg`}
                  alt={hotel.displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    5-Star
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                      {hotel.displayName}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{hotel.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{hotel._count.roomTypes}</div>
                    <div className="text-xs text-slate-500">Room Types</div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 h-16 overflow-hidden text-ellipsis">
                  {hotel.description || `Experience luxury and comfort in the heart of ${hotel.city}.`}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{hotel._count.guests}+ Happy Guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Utensils className="h-4 w-4 text-primary" />
                    <span>Fine Dining</span>
                  </div>
                </div>
                
                <Button asChild className="w-full">
                    <Link href={`/property/${hotel.id}`}>
                        Explore Hotel
                    </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}