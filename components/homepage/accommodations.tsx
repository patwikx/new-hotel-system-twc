"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, ArrowRight, Building, Users, Bed, Phone, Mail, Globe } from "lucide-react"
import { motion } from "framer-motion"

// Updated interface to match BusinessUnit model
interface BusinessUnit {
  id: string;
  displayName: string;
  propertyType: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  primaryColor: string | null;
  checkInTime: string;
  checkOutTime: string;
  isActive: boolean;
  _count?: {
    rooms: number;
    roomTypes: number;
  };
}

interface BusinessUnitsSectionProps {
  businessUnits: BusinessUnit[];
}

export function BusinessUnitsSection({ businessUnits = [] }: BusinessUnitsSectionProps) {
  if (businessUnits.length === 0) return null;

  // Function to get property type display info
  const getPropertyTypeInfo = (type: string) => {
    const typeMap = {
      'HOTEL': { label: 'Hotel', color: 'bg-blue-500' },
      'RESORT': { label: 'Resort', color: 'bg-green-500' },
      'VILLA_COMPLEX': { label: 'Villa Complex', color: 'bg-purple-500' },
      'APARTMENT_HOTEL': { label: 'Apartment Hotel', color: 'bg-orange-500' },
      'BOUTIQUE_HOTEL': { label: 'Boutique Hotel', color: 'bg-pink-500' },
    };
    return typeMap[type as keyof typeof typeMap] || { label: type, color: 'bg-slate-500' };
  };

  // Function to format address
  const formatAddress = (businessUnit: BusinessUnit) => {
    const parts = [businessUnit.address, businessUnit.city, businessUnit.state, businessUnit.country]
      .filter(Boolean);
    return parts.join(', ');
  };

  return (
    <section id="properties" className="py-24 bg-slate-50 relative overflow-hidden">
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
            Our Properties
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover our collection of premium properties across the Philippines, each offering unique experiences and world-class hospitality.
          </p>
        </motion.div>

        {/* Enhanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businessUnits.map((property, index) => {
            const typeInfo = getPropertyTypeInfo(property.propertyType);
            const address = formatAddress(property);
            
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-slate-200 hover:border-slate-300 relative h-full flex flex-col">
                  {/* Image Container with Overlay */}
                  <div className="relative h-72 overflow-hidden">
                    {property.logo ? (
                      <img
                        src={property.logo}
                        alt={property.displayName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          // Fallback to gradient background
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.background = `linear-gradient(135deg, ${property.primaryColor || '#64748b'}, ${property.primaryColor ? property.primaryColor + '80' : '#475569'})`;
                          }
                        }}
                      />
                    ) : (
                      // Default gradient background when no logo exists
                      <div 
                        className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${property.primaryColor || '#64748b'}, ${property.primaryColor ? property.primaryColor + '80' : '#475569'})`
                        }}
                      >
                        {property.displayName.split(' ').map(word => word[0]).join('').substring(0, 3)}
                      </div>
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    
                    {/* Property Type Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${typeInfo.color} text-white font-medium border-0`}>
                        <Building className="h-3 w-3 mr-1.5" />
                        {typeInfo.label}
                      </Badge>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-amber-500/90 backdrop-blur-sm border border-amber-400/20 text-white font-medium">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        4.8
                      </Badge>
                    </div>

                    {/* Location Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-slate-700 font-medium line-clamp-2">
                            {address || `${property.city}, ${property.country}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Property Title */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-slate-900 font-serif mb-2 group-hover:text-slate-700 transition-colors">
                        {property.displayName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-medium">
                          {property.city}
                        </Badge>
                        {property.state && (
                          <Badge variant="outline" className="text-xs font-medium">
                            {property.state}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 mb-6 text-sm leading-relaxed line-clamp-3 flex-1">
                      {property.description || 
                       `Experience exceptional hospitality at our ${typeInfo.label.toLowerCase()} in ${property.city}. Discover premium accommodations, world-class amenities, and personalized service in the heart of the Philippines.`}
                    </p>

                    {/* Property Stats */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          <span>{property._count?.rooms || 'Multiple'} rooms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{property._count?.roomTypes || 'Various'} room types</span>
                        </div>
                      </div>
                    </div>

                    {/* Check-in/Check-out Times */}
                    <div className="flex items-center justify-between mb-6 py-4 border-t border-slate-100">
                      <div className="text-sm text-slate-600">
                        <div className="font-medium">Check-in</div>
                        <div className="text-xs">{property.checkInTime}</div>
                      </div>
                      <div className="text-sm text-slate-600 text-right">
                        <div className="font-medium">Check-out</div>
                        <div className="text-xs">{property.checkOutTime}</div>
                      </div>
                    </div>

                    {/* Contact Info
                    {(property.phone || property.email || property.website) && (
                      <div className="mb-6 p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs font-medium text-slate-700 mb-2">Contact</div>
                        <div className="space-y-1">
                          {property.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Phone className="h-3 w-3" />
                              <span>{property.phone}</span>
                            </div>
                          )}
                          {property.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{property.email}</span>
                            </div>
                          )}
                          {property.website && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Globe className="h-3 w-3" />
                              <span className="truncate">Website</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                       */}

                    {/* CTA Button */}
                    <Button 
                      className="w-full group/btn bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg mt-auto"
                      size="lg"
                    >
                      Explore Property
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </CardContent>

                  {/* Decorative corner accent with property color */}
                  <div 
                    className="absolute top-0 left-0 w-12 h-12 transform -rotate-45 -translate-x-6 -translate-y-6 group-hover:opacity-80 transition-opacity duration-300"
                    style={{ 
                      backgroundColor: property.primaryColor || '#e2e8f0' 
                    }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 mb-6">
            Can&Apos;t decide which property to choose? Let our team help you find the perfect stay.
          </p>
          <Button 
            size="lg" 
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
          >
            Contact Our Concierge
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}