"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Coffee,
  Shield,
  Users,
  CheckCircle,
  Plane,
  ShoppingBag,
  HelpCircle, // A good fallback icon
} from "lucide-react"

// A mapping of potential icon names from your database to the actual icon components
const iconMap: { [key: string]: React.ElementType } = {
  Laundry: ShoppingBag,
  Transportation: Plane,
  Dining: Utensils,
  Fitness: Dumbbell,
  Pool: Waves,
  Business: Users,
  Concierge: Shield,
  Wifi: Wifi, // Matching the 'icon' field value
  Parking: Car,
  Coffee: Coffee,
}

// --- FIX 1: Update the props interface to match the Prisma model exactly ---
// 'description', 'icon', and 'category' can be `string | null`.
interface Amenity {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface AmenitiesSectionProps {
  amenities: Amenity[];
}

export function AmenitiesSection({ amenities = [] }: AmenitiesSectionProps) {
  // REMOVED: Internal useState and useEffect for data fetching are no longer needed.
  // This component now receives all its data via props.

  if (amenities.length === 0) return null

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold font-serif text-slate-900 mb-6 tracking-tight">
            Premium{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Amenities</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Experience exceptional hospitality with our comprehensive range of luxury services and facilities.
          </p>
          <div className="flex items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Complimentary Access</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="text-sm font-medium">Premium Quality</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((item) => {
            // Use the 'icon' field from the amenity to look up the component, with a fallback.
            const IconComponent = item.icon ? iconMap[item.icon] || HelpCircle : HelpCircle;

            return (
              <Card
                key={item.id}
                className="group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 border hover:border-cyan-200 bg-white hover:bg-white hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl flex items-center justify-center transition-all duration-500">
                    <IconComponent className="w-10 h-10 text-cyan-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {item.name}
                  </h3>

                  <p className="text-slate-600 mb-6 leading-relaxed text-base min-h-[72px]">
                    {item.description}
                  </p>

                  {item.category && (
                    <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 font-medium">
                      {item.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}