"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Utensils, Clock, Users, MapPin, Star, Phone, ArrowRight, Award, ChefHat, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Define the structure for a single day's hours
interface DayHours {
  open: string   // e.g., "06:00"
  close: string  // e.g., "22:00"
  closed: boolean
}

// Define the days of the week for better type-safety
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// The main type for the operatingHours object
export type OperatingHours = Partial<Record<DayOfWeek, DayHours>>;

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  image?: string
  allergens: string[]
  dietary: string[]
  isSignature: boolean
  isRecommended: boolean
  spiceLevel?: number
}

interface Restaurant {
  id: string
  name: string
  slug: string
  description: string
  shortDesc?: string | null
  type: string
  cuisine: string[]
  location?: string | null
  phone?: string | null
  totalSeats?: number | null
  priceRange?: string | null
  dressCode?: string | null
  featuredImage?: string | null
  images: string[]
  isActive: boolean
  isPublished: boolean
  isFeatured: boolean
  acceptsReservations: boolean
  operatingHours?: OperatingHours | null
  averageMeal?: number
  features: string[]
  // Add menu items for the featured restaurant
  menuItems?: MenuItem[]
}

interface RestaurantsSectionProps {
  restaurants: Restaurant[]
}

export function RestaurantsSection({ restaurants = [] }: RestaurantsSectionProps) {
  const publishedRestaurants = restaurants.filter(r => r.isActive && r.isPublished)
  
  if (publishedRestaurants.length === 0) return null

  // Get the most featured restaurant (prioritize isFeatured, then by sortOrder)
  const featuredRestaurant = publishedRestaurants.find(r => r.isFeatured) || publishedRestaurants[0]
  
  if (!featuredRestaurant) return null

  const getPriceRangeDisplay = (range?: string | null) => {
    const ranges = {
      "$": "Budget Friendly",
      "$$": "Moderate",
      "$$$": "Upscale",
      "$$$$": "Fine Dining"
    }
    return ranges[range as keyof typeof ranges] || "Moderate"
  }

  const getTypeColor = (type: string) => {
    const colors = {
      FINE_DINING: "bg-gradient-to-r from-purple-500 to-purple-600",
      CASUAL_DINING: "bg-gradient-to-r from-blue-500 to-blue-600",
      CAFE: "bg-gradient-to-r from-orange-500 to-orange-600",
      BAR: "bg-gradient-to-r from-red-500 to-red-600",
      POOLSIDE: "bg-gradient-to-r from-cyan-500 to-cyan-600",
      BUFFET: "bg-gradient-to-r from-green-500 to-green-600",
      SPECIALTY: "bg-gradient-to-r from-amber-500 to-amber-600"
    }
    return colors[type as keyof typeof colors] || "bg-gradient-to-r from-slate-500 to-slate-600"
  }

  // Helper function to get today's hours
  const getTodaysHours = (hours?: OperatingHours | null): string => {
    if (!hours) return "Hours not available"
    
    const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek
    const todaysData = hours[today]

    if (!todaysData || todaysData.closed) return "Closed today"
    
    const formatTime = (time: string) => {
      const [hour, minute] = time.split(':')
      const hourNum = parseInt(hour, 10)
      const ampm = hourNum >= 12 ? 'PM' : 'AM'
      const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12
      return `${formattedHour}:${minute} ${ampm}`
    }

    return `Open today • ${formatTime(todaysData.open)} - ${formatTime(todaysData.close)}`
  }

  // Mock menu items for demonstration (in real app, this would come from the database)
  const mockMenuItems: MenuItem[] = [
    {
      id: "1",
      name: "Grilled Lobster Thermidor",
      description: "Fresh lobster tail grilled to perfection with herb butter, served with seasonal vegetables",
      price: 2850,
      currency: "PHP",
      image: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&h=300&fit=crop",
      allergens: ["Shellfish"],
      dietary: ["Gluten-Free"],
      isSignature: true,
      isRecommended: true,
      spiceLevel: 1
    },
    {
      id: "2", 
      name: "Wagyu Beef Tenderloin",
      description: "Premium A5 Wagyu beef with truffle mashed potatoes and red wine reduction",
      price: 4200,
      currency: "PHP",
      image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
      allergens: [],
      dietary: [],
      isSignature: true,
      isRecommended: true,
      spiceLevel: 1
    },
    {
      id: "3",
      name: "Pan-Seared Duck Breast",
      description: "Five-spice duck breast with cherry gastrique and roasted root vegetables",
      price: 1950,
      currency: "PHP", 
      image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop",
      allergens: [],
      dietary: [],
      isSignature: false,
      isRecommended: true,
      spiceLevel: 2
    },
    {
      id: "4",
      name: "Seafood Paella Valenciana",
      description: "Traditional Spanish paella with fresh seafood, saffron rice, and garden vegetables",
      price: 1680,
      currency: "PHP",
      image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop",
      allergens: ["Shellfish"],
      dietary: ["Gluten-Free"],
      isSignature: false,
      isRecommended: true,
      spiceLevel: 2
    }
  ]

  // Get best selling items (mock data - in real app this would come from database)
  const bestSellingItems = mockMenuItems.filter(item => item.isRecommended).slice(0, 4)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(15 23 42) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        > 
          <h2 className="text-5xl md:text-7xl font-bold font-serif text-slate-900 mb-6 leading-tight">
            Culinary
            <span className="block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Excellence
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Experience exceptional dining crafted by world-class chefs using the finest local and international ingredients
          </p>
        </motion.div>

        {/* Featured Restaurant Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto mb-20"
        >
          <Card className="overflow-hidden shadow-2xl bg-white border-0 hover:shadow-3xl transition-all duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              {/* Image Side */}
              <div className="relative overflow-hidden group">
                <img
                  src={featuredRestaurant.featuredImage || featuredRestaurant.images[0] || "/placeholder.svg"}
                  alt={featuredRestaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Restaurant Type Badge */}
                <div className="absolute top-6 left-6">
                  <Badge className={`${getTypeColor(featuredRestaurant.type)} text-white border-0 font-semibold px-4 py-2 text-sm shadow-lg`}>
                    <Award className="h-4 w-4 mr-1" />
                    {featuredRestaurant.type.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Location & Hours */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                  {featuredRestaurant.location && (
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg w-fit">
                      <MapPin className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">{featuredRestaurant.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg w-fit">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">{getTodaysHours(featuredRestaurant.operatingHours)}</span>
                  </div>
                </div>

                {/* Price Range */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
                  <div className="text-lg font-bold text-slate-900">
                    {featuredRestaurant.priceRange || "$$"}
                  </div>
                  <div className="text-xs text-slate-600 text-center">{getPriceRangeDisplay(featuredRestaurant.priceRange)}</div>
                </div>
              </div>

              {/* Content Side */}
              <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  {/* Restaurant Name */}
                  <div>
                    <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 font-serif mb-4 leading-tight">
                      {featuredRestaurant.name}
                    </h3>
                    
                    {/* Cuisine Types */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredRestaurant.cuisine.map((cuisine) => (
                        <Badge key={cuisine} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {featuredRestaurant.description}
                  </p>

                  {/* Features */}
                  {featuredRestaurant.features?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Restaurant Features
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {featuredRestaurant.features.slice(0, 4).map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Restaurant Details */}
                  <div className="grid grid-cols-2 gap-6 py-4">
                    {featuredRestaurant.totalSeats && (
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <Users className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <div className="font-bold text-slate-900">{featuredRestaurant.totalSeats}</div>
                        <div className="text-xs text-slate-600">Total Seats</div>
                      </div>
                    )}
                    
                    {featuredRestaurant.averageMeal && (
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <Utensils className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <div className="font-bold text-slate-900">₱{featuredRestaurant.averageMeal.toLocaleString()}</div>
                        <div className="text-xs text-slate-600">Average Meal</div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      asChild 
                      size="lg"
                      className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <Link href={`/restaurants/${featuredRestaurant.slug}`}>
                        <ChefHat className="h-5 w-5 mr-2" />
                        View Full Menu
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    
                    {featuredRestaurant.acceptsReservations && (
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-2 border-slate-300 hover:bg-slate-50 font-semibold hover:border-slate-400 transition-all duration-300"
                        asChild
                      >
                        <Link href={`/restaurants/${featuredRestaurant.slug}/reserve`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Reserve Table
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Best Selling Menu Items */}
        {bestSellingItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-16">   
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 font-serif mb-4">
                Signature Dishes
              </h3>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover our most beloved culinary creations, crafted with passion and perfected over time
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellingItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-slate-200 hover:border-slate-300">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Signature Badge */}
                      {item.isSignature && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 font-medium shadow-lg">
                            <Award className="h-3 w-3 mr-1" />
                            Signature
                          </Badge>
                        </div>
                      )}

                      {/* Spice Level */}
                      {item.spiceLevel && item.spiceLevel > 1 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
                          {Array.from({ length: item.spiceLevel }, (_, i) => "🌶").join('')}
                        </div>
                      )}

                      {/* Price */}
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1">
                        <div className="font-bold text-slate-900">
                          ₱{item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h4 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
                        {item.name}
                      </h4>
                      
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Dietary & Allergen Info */}
                      <div className="space-y-2">
                        {item.dietary.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.dietary.map((diet) => (
                              <Badge key={diet} className="bg-green-100 text-green-800 text-xs border-0">
                                {diet}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {item.allergens.length > 0 && (
                          <div className="text-xs text-slate-500">
                            <span className="font-medium">Contains:</span> {item.allergens.join(', ')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 border border-slate-700 max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-50" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-400/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h3 className="text-4xl md:text-5xl font-bold text-white font-serif mb-6 leading-tight">
                Reserve Your Table
              </h3>
              <p className="text-slate-300 mb-10 max-w-3xl mx-auto text-lg leading-relaxed">
                Experience unforgettable flavors and exceptional service. Our culinary team is ready to create 
                a memorable dining experience tailored just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-xl px-8 py-4 text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Call for Reservations
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg backdrop-blur-sm">
                  <Utensils className="mr-2 h-5 w-5" />
                  Explore All Dining Options
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}