"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Testimonial {
  id: string;
  guestName: string;
  guestTitle: string | null;
  content: string;
  rating: number | null;
  guestImage: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials = [] }: TestimonialsSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (testimonials.length === 0) return null

  // Triple the testimonials for seamless infinite scroll
  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials];
  
  // Calculate total width for animation
  const cardWidth = 384; // w-96 = 384px
  const gap = 24; // gap-6 = 24px
  const totalWidth = testimonials.length * (cardWidth + gap);

  return (
    <section className="bg-slate-50 overflow-hidden relative">
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
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 mb-6"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Guest Testimonials
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4"
          >
            What Our Guests Say
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Real stories from our valued guests who have experienced our hospitality and made lasting memories with us.
          </motion.p>
        </div>

        {/* Testimonials Scroll Container */}
        <div className="relative">
          {/* Left fade overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          
          {/* Right fade overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="overflow-hidden py-4">
            {isClient && (
              <motion.div
                className="flex gap-6"
                animate={{
                  x: [-totalWidth, 0],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: testimonials.length * 8, // Adjust speed here
                    ease: "linear",
                  },
                }}
              >
                {extendedTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={`${testimonial.id}-${index}`}
                    className="flex-shrink-0 w-96"
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Card className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 group relative overflow-hidden">
                      {/* Decorative corner accent */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 transform rotate-45 translate-x-8 -translate-y-8 group-hover:bg-slate-100 transition-colors duration-300" />
                      
                      <CardContent className="p-8 relative">
                        {/* Large quote mark background */}
                        <div className="absolute top-4 right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                          <Quote className="w-20 h-20 text-slate-900" />
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 mb-6 relative z-10">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < (testimonial.rating || 0)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-slate-500 font-medium">
                            {testimonial.rating || 5}.0
                          </span>
                        </div>

                        {/* Testimonial Content */}
                        <blockquote className="text-slate-700 mb-8 leading-relaxed text-base font-medium relative z-10 font-serif italic">
                          {testimonial.content}
                        </blockquote>

                        {/* Decorative line */}
                        <div className="w-12 h-px bg-slate-200 mb-6 group-hover:w-16 group-hover:bg-slate-300 transition-all duration-300" />

                        {/* Author Info */}
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 ring-2 ring-slate-100 group-hover:ring-slate-200 transition-all duration-300">
                              <Image
                                src="/avatar-placeholder.png"
                                alt={`${testimonial.guestName} avatar`}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-base font-serif">
                              {testimonial.guestName}
                            </div>
                            {testimonial.guestTitle && (
                              <div className="text-sm text-slate-600 mt-1">
                                {testimonial.guestTitle}
                              </div>
                            )}
                            <div className="text-xs text-slate-400 mt-1">
                              Verified Guest
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom CTA or Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-8 bg-white px-8 py-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-600">Happy Clients</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">4.9</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">98%</div>
              <div className="text-sm text-slate-600">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}