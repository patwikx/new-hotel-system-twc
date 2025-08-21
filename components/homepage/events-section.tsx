"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, ArrowRight, Star, Ticket, Heart } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Event {
  id: string
  title: string
  slug: string
  description: string
  shortDesc?: string
  type: string
  status: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  venue: string
  venueDetails?: string
  venueCapacity?: number
  isFree: boolean
  ticketPrice?: number
  maxAttendees?: number
  currentAttendees: number
  category: string[]
  tags: string[]
  featuredImage?: string
  isPublished: boolean
  isFeatured: boolean
  isPinned: boolean
  isAdultsOnly: boolean
  isFamilyEvent: boolean
  hostName?: string
}

interface EventsSectionProps {
  events: Event[]
}

export function EventsSection({ events = [] }: EventsSectionProps) {
  const upcomingEvents = events.filter(event => 
    event.isPublished && 
    event.status === 'CONFIRMED' &&
    new Date(event.startDate) > new Date()
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  
  if (upcomingEvents.length === 0) return null

  const getTypeColor = (type: string) => {
    const colors = {
      WEDDING: "bg-pink-100 text-pink-800",
      CONFERENCE: "bg-blue-100 text-blue-800",
      MEETING: "bg-gray-100 text-gray-800",
      WORKSHOP: "bg-green-100 text-green-800",
      CELEBRATION: "bg-purple-100 text-purple-800",
      CULTURAL: "bg-amber-100 text-amber-800",
      SEASONAL: "bg-cyan-100 text-cyan-800",
      ENTERTAINMENT: "bg-red-100 text-red-800",
      CORPORATE: "bg-indigo-100 text-indigo-800",
      PRIVATE: "bg-slate-100 text-slate-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatEventDate = (startDate: string, endDate: string, startTime?: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const isSameDay = start.toDateString() === end.toDateString()
    
    if (isSameDay) {
      return `${start.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })}${startTime ? ` at ${startTime}` : ''}`
    } else {
      return `${start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })}`
    }
  }

  const getAvailabilityStatus = (maxAttendees?: number, currentAttendees?: number) => {
    if (!maxAttendees) return null
    const remaining = maxAttendees - (currentAttendees || 0)
    const percentFull = ((currentAttendees || 0) / maxAttendees) * 100
    
    if (remaining <= 0) return { status: "Full", color: "bg-red-100 text-red-800" }
    if (percentFull >= 80) return { status: `${remaining} spots left`, color: "bg-orange-100 text-orange-800" }
    return { status: `${remaining} spots available`, color: "bg-green-100 text-green-800" }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-green-200/20 to-cyan-200/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200 text-sm font-medium text-blue-700 mb-6">
            <Calendar className="w-4 h-4" />
            Upcoming Events
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">
            Events & Activities
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join us for unforgettable experiences, cultural celebrations, and exciting activities designed to create lasting memories.
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.slice(0, 6).map((event, index) => {
            const availability = getAvailabilityStatus(event.maxAttendees, event.currentAttendees)
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-slate-200 hover:border-slate-300 relative h-full">
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.featuredImage || `/placeholder.svg`}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    
                    {/* Event Type Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${getTypeColor(event.type)} border-0 font-medium`}>
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      {event.isFree ? (
                        <Badge className="bg-green-500/90 backdrop-blur-sm border border-green-400/20 text-white font-bold">
                          FREE
                        </Badge>
                      ) : (
                        <Badge className="bg-white/95 backdrop-blur-sm border border-white/20 text-slate-900 font-bold">
                          ₱{event.ticketPrice?.toLocaleString()}
                        </Badge>
                      )}
                    </div>

                    {/* Featured/Pinned Badges */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      {event.isFeatured && (
                        <Badge className="bg-amber-500/90 backdrop-blur-sm border border-amber-400/20 text-white font-medium">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                      {event.isPinned && (
                        <Badge className="bg-purple-500/90 backdrop-blur-sm border border-purple-400/20 text-white font-medium">
                          Pinned
                        </Badge>
                      )}
                    </div>

                    {/* Availability Status */}
                    {availability && (
                      <div className="absolute bottom-4 right-4">
                        <Badge className={`${availability.color} border-0 font-medium`}>
                          {availability.status}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 flex flex-col flex-grow">
                    {/* Event Title */}
                    <h3 className="text-xl font-bold text-slate-900 font-serif mb-2 group-hover:text-slate-700 transition-colors">
                      {event.title}
                    </h3>

                    {/* Categories & Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.category.slice(0, 2).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {event.tags.slice(0, 1).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                      {event.shortDesc || event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{formatEventDate(event.startDate, event.endDate, event.startTime)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{event.venue}</span>
                      </div>

                      {event.maxAttendees && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span>Max {event.maxAttendees} attendees</span>
                        </div>
                      )}

                      {event.hostName && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="font-medium">Host:</span>
                          <span>{event.hostName}</span>
                        </div>
                      )}

                      {/* Age Restrictions */}
                      <div className="flex gap-2">
                        {event.isAdultsOnly && (
                          <Badge variant="outline" className="text-xs">
                            Adults Only
                          </Badge>
                        )}
                        {event.isFamilyEvent && (
                          <Badge variant="outline" className="text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            Family Friendly
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        asChild 
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        <Link href={`/events/${event.slug}`}>
                          Learn More
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                      
                      {!event.isFree && (
                        <Button 
                          variant="outline" 
                          className="flex-1 border-slate-300 hover:bg-slate-50"
                          asChild
                        >
                          <Link href={`/events/${event.slug}/book`}>
                            <Ticket className="h-4 w-4 mr-2" />
                            Book Now
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 left-0 w-12 h-12 bg-slate-100 transform -rotate-45 -translate-x-6 -translate-y-6 group-hover:bg-slate-200 transition-colors duration-300" />
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-slate-900 font-serif mb-4">
              Never Miss an Event
            </h3>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Stay updated with our latest events, cultural shows, and special activities. 
              Subscribe to our newsletter and be the first to know about upcoming experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 font-medium">
                <Calendar className="mr-2 h-4 w-4" />
                View Event Calendar
              </Button>
              <Button variant="outline" size="lg" className="font-medium border-slate-300 hover:bg-slate-50">
                <Heart className="mr-2 h-4 w-4" />
                Subscribe to Updates
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}