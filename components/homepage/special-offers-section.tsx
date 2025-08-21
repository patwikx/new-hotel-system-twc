"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Calendar, Clock, Users, ArrowRight, Percent, Tag, Star, Sparkles, Eye, Heart } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

interface SpecialOffer {
  id: string
  title: string
  slug: string
  subtitle?: string
  shortDesc?: string
  type: string
  status: string
  offerPrice: number
  originalPrice?: number
  validFrom: string
  validTo: string
  minNights: number
  maxNights?: number
  inclusions: string[]
  featuredImage?: string
  isPublished: boolean
  isFeatured: boolean
  isPinned: boolean
  savingsPercent?: number
}

interface SpecialOffersSectionProps {
  specialOffers: SpecialOffer[]
}

export function SpecialOffersSection({ specialOffers = [] }: SpecialOffersSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const activeOffers = specialOffers.filter(offer => 
    offer.isPublished && 
    offer.status === 'ACTIVE' &&
    new Date(offer.validTo) > new Date()
  )
  
  if (activeOffers.length === 0) return null

  const getTypeConfig = (type: string) => {
    const configs = {
      EARLY_BIRD: { 
        color: "bg-gradient-to-r from-emerald-500 to-teal-600", 
        icon: Clock,
        light: "from-emerald-50 to-teal-50",
        border: "border-emerald-200",
        text: "text-emerald-700"
      },
      LAST_MINUTE: { 
        color: "bg-gradient-to-r from-red-500 to-rose-600", 
        icon: Clock,
        light: "from-red-50 to-rose-50",
        border: "border-red-200", 
        text: "text-red-700"
      },
      SEASONAL: { 
        color: "bg-gradient-to-r from-blue-500 to-indigo-600", 
        icon: Calendar,
        light: "from-blue-50 to-indigo-50",
        border: "border-blue-200",
        text: "text-blue-700"
      },
      PACKAGE: { 
        color: "bg-gradient-to-r from-purple-500 to-violet-600", 
        icon: Gift,
        light: "from-purple-50 to-violet-50",
        border: "border-purple-200",
        text: "text-purple-700"
      },
      ROOM_UPGRADE: { 
        color: "bg-gradient-to-r from-amber-500 to-orange-600", 
        icon: Star,
        light: "from-amber-50 to-orange-50",
        border: "border-amber-200",
        text: "text-amber-700"
      },
      DINING: { 
        color: "bg-gradient-to-r from-orange-500 to-red-600", 
        icon: Gift,
        light: "from-orange-50 to-red-50",
        border: "border-orange-200",
        text: "text-orange-700"
      },
      SPA: { 
        color: "bg-gradient-to-r from-pink-500 to-rose-600", 
        icon: Sparkles,
        light: "from-pink-50 to-rose-50",
        border: "border-pink-200",
        text: "text-pink-700"
      },
      ACTIVITY: { 
        color: "bg-gradient-to-r from-cyan-500 to-blue-600", 
        icon: Users,
        light: "from-cyan-50 to-blue-50",
        border: "border-cyan-200",
        text: "text-cyan-700"
      },
      LOYALTY: { 
        color: "bg-gradient-to-r from-indigo-500 to-purple-600", 
        icon: Star,
        light: "from-indigo-50 to-purple-50",
        border: "border-indigo-200",
        text: "text-indigo-700"
      },
      PROMO_CODE: { 
        color: "bg-gradient-to-r from-gray-500 to-slate-600", 
        icon: Tag,
        light: "from-gray-50 to-slate-50",
        border: "border-gray-200",
        text: "text-gray-700"
      }
    }
    return configs[type as keyof typeof configs] || configs.PROMO_CODE
  }

  const calculateSavings = (original?: number, offer?: number) => {
    if (!original || !offer) return null
    const savings = ((original - offer) / original) * 100
    return Math.round(savings)
  }

  const isExpiringSoon = (validTo: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validTo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7
  }

  const getDaysRemaining = (validTo: string) => {
    const days = Math.ceil((new Date(validTo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <section className="py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-[28rem] h-[28rem] bg-gradient-to-br from-purple-200/20 to-pink-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-blue-200/15 to-cyan-300/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-purple-400/60 rounded-full animate-bounce" style={{animationDelay: '1.5s'}} />
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-bounce" style={{animationDelay: '2.5s'}} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-8 py-4 rounded-full border border-amber-200/50 shadow-lg backdrop-blur-sm text-sm font-semibold text-amber-700 mb-8 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <Gift className="w-5 h-5" />
              <motion.div 
                className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="tracking-wide">Exclusive Limited-Time Offers</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Special Offers
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              & Packages
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            Discover carefully curated experiences and exclusive packages designed to create unforgettable moments during your stay.
          </motion.p>
        </motion.div>

        {/* Auto-Scrolling Offers Carousel */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div 
            className="flex gap-8"
            animate={{
              x: isHovered ? undefined : [`0%`, `-${50}%`]
            }}
            transition={{
              duration: activeOffers.length * 6, // Smooth speed based on content
              ease: "linear",
              repeat: isHovered ? 0 : Infinity,
            }}
          >
            {/* Duplicate offers for seamless loop */}
            {[...activeOffers, ...activeOffers].map((offer, index) => {
            const savings = calculateSavings(offer.originalPrice, offer.offerPrice)
            const expiringSoon = isExpiringSoon(offer.validTo)
            const daysRemaining = getDaysRemaining(offer.validTo)
            const typeConfig = getTypeConfig(offer.type)
            const IconComponent = typeConfig.icon
            const isHovered = hoveredCard === offer.id
            
            return (
              <motion.div
                key={`${offer.id}-${index}`}
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.02 }}
                onHoverStart={() => setHoveredCard(offer.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group cursor-pointer flex-none w-[400px]"
              >
                <Card className="overflow-hidden shadow-xl hover:shadow-3xl transition-all duration-700 bg-white/95 backdrop-blur-sm border-0 hover:bg-white relative h-full">
                  {/* Enhanced Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      src={offer.featuredImage || `/placeholder.svg`}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    
                    {/* Dynamic overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 0.4 }}
                      transition={{ duration: 0.5 }}
                    />
                    
                    {/* Floating offer type badge */}
                    <motion.div 
                      className="absolute top-6 left-6"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`${typeConfig.color} backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 font-medium`}>
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm">{offer.type.replace('_', ' ')}</span>
                      </div>
                    </motion.div>

                    {/* Enhanced savings badge */}
                    {savings && (
                      <motion.div 
                        className="absolute top-6 right-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg border border-white/30 font-bold flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          <span>Save {savings}%</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Expiring soon with countdown */}
                    {expiringSoon && (
                      <motion.div 
                        className="absolute top-20 right-6"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 backdrop-blur-sm text-white px-3 py-2 rounded-full shadow-lg border border-white/30 font-medium flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          <span>{daysRemaining} days left</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Premium badges */}
                    <div className="absolute bottom-6 left-6 flex gap-2">
                      {offer.isFeatured && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-lg border border-white/30 font-medium text-sm flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                          </div>
                        </motion.div>
                      )}
                      {offer.isPinned && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <div className="bg-gradient-to-r from-purple-500 to-violet-600 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-lg border border-white/30 font-medium text-sm flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            Popular
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Hover overlay effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 pointer-events-none"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <CardContent className="p-6 flex flex-col flex-grow">
                    {/* Enhanced Title & Subtitle */}
                    <div className="mb-4">
                      <motion.h3 
                        className="text-xl font-bold text-slate-900 font-serif mb-1 group-hover:text-slate-700 transition-colors line-clamp-2"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.3 }}
                      >
                        {offer.title}
                      </motion.h3>
                      {offer.subtitle && (
                        <p className="text-sm text-slate-600 font-medium bg-gradient-to-r from-slate-600 to-slate-500 bg-clip-text">{offer.subtitle}</p>
                      )}
                    </div>

                    {/* Enhanced Description */}
                    <p className="text-slate-600 text-sm mb-4 flex-grow leading-relaxed line-clamp-2">
                      {offer.shortDesc || offer.title}
                    </p>

                    {/* Enhanced Pricing */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-3 mb-2">
                        <motion.div 
                          className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-serif"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          ₱{offer.offerPrice.toLocaleString()}
                        </motion.div>
                        {offer.originalPrice && (
                          <div className="text-xl text-slate-400 line-through">
                            ₱{offer.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Starting from • {offer.minNights} night{offer.minNights > 1 ? 's' : ''} minimum</span>
                      </div>
                    </div>

                    {/* Enhanced Inclusions */}
                    {offer.inclusions.length > 0 && (
                      <div className="mb-8">
                        <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Gift className="h-4 w-4 text-amber-500" />
                          What&apos;s Included:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {offer.inclusions.slice(0, 3).map((inclusion, idx) => (
                            <motion.div
                              key={inclusion}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: idx * 0.1 }}
                            >
                              <Badge className={`bg-gradient-to-r ${typeConfig.light} ${typeConfig.border} ${typeConfig.text} border text-xs font-medium px-2 py-0.5`}>
                                {inclusion}
                              </Badge>
                            </motion.div>
                          ))}
                          {offer.inclusions.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-slate-50 px-2 py-0.5">
                              +{offer.inclusions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Validity */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg border border-slate-200/50">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <Calendar className="h-3 w-3 text-slate-500" />
                        </div>
                        <span className="font-medium text-xs">
                          Valid: {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-auto"
                    >
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:via-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-lg transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/25 group/btn relative overflow-hidden text-sm"
                        size="sm"
                      >
                        <Link href={`/offers/${offer.slug}`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Book This Offer
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </span>
                        </Link>
                      </Button>
                    </motion.div>
                  </CardContent>

                  {/* Enhanced corner accent */}
                  <motion.div 
                    className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 transform rotate-45 translate-x-8 -translate-y-8 opacity-70"
                    whileHover={{ 
                      scale: 1.2,
                      rotate: 45,
                      background: "linear-gradient(to bottom right, rgb(252 211 77), rgb(251 146 60))"
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Subtle glow effect on hover */}
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg opacity-0 blur-lg"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Card>
              </motion.div>
            )
          })}
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 60px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .shadow-3xl {
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  )
}