"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Bed, ArrowRight, MapPin, Star, Wifi, Coffee, Car } from "lucide-react"
import { motion } from "framer-motion"

// This interface now correctly matches the data being passed from page.tsx
interface RoomType {
  id: string;
  displayName: string;
  type: string;
  description: string | null;
  maxOccupancy: number;
  bedConfiguration: string | null;
  baseRate: number; // This is now correctly expected as a number
  primaryImage: string | null;
  businessUnit: {
    displayName: string;
  };
}

interface AccommodationsSectionProps {
  accommodations: RoomType[];
}

export function AccommodationsSection({ accommodations = [] }: AccommodationsSectionProps) {
  if (accommodations.length === 0) return null;

  // Sample amenities - you can customize this based on your room data
  const getAmenities = (roomType: string) => {
    const baseAmenities = [
      { icon: Wifi, label: "Free WiFi" },
      { icon: Coffee, label: "Coffee/Tea" },
    ];
    
    if (roomType.toLowerCase().includes('suite') || roomType.toLowerCase().includes('deluxe')) {
      return [...baseAmenities, { icon: Car, label: "Parking" }];
    }
    return baseAmenities;
  };

  return (
    <section id="accommodations" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">
            Our Accommodations
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose from our selection of beautifully appointed rooms and suites, designed for your comfort and relaxation.
          </p>
        </motion.div>

        {/* Enhanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accommodations.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-slate-200 hover:border-slate-300 relative">
                {/* Image Container with Overlay */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={room.primaryImage || `/placeholder.svg`}
                    alt={room.displayName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                  
                  {/* Location Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm border border-white/20 text-slate-700 font-medium">
                      <MapPin className="h-3 w-3 mr-1.5" />
                      {room.businessUnit.displayName}
                    </Badge>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-amber-500/90 backdrop-blur-sm border border-amber-400/20 text-white font-medium">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      4.8
                    </Badge>
                  </div>

                  {/* Price Overlay */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                    <div className="text-xl font-bold text-slate-900 font-serif">
                      ₱{room.baseRate.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">per night</div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Room Title */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-slate-900 font-serif mb-2 group-hover:text-slate-700 transition-colors">
                      {room.displayName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-medium">
                        {room.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 mb-6 text-sm leading-relaxed line-clamp-3">
                    {room.description || "Experience luxury and comfort in this beautifully appointed accommodation with premium amenities and stunning views."}
                  </p>

                  {/* Amenities */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      {getAmenities(room.type).map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <amenity.icon className="h-3 w-3" />
                          <span>{amenity.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="flex items-center justify-between mb-6 py-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>{room.maxOccupancy} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Bed className="h-4 w-4 text-slate-400" />
                      <span>{room.bedConfiguration || "Premium bed"}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full group/btn bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
                    size="lg"
                  >
                    View Details & Book
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Button>
                </CardContent>

                {/* Decorative corner accent */}
                <div className="absolute top-0 left-0 w-12 h-12 bg-slate-100 transform -rotate-45 -translate-x-6 -translate-y-6 group-hover:bg-slate-200 transition-colors duration-300" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}