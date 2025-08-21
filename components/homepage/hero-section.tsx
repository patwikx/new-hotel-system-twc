// components/homepage/hero-section.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { HeroSlide } from "@/types/cms" // Assuming this type is compatible

interface HeroSectionProps {
  heroSections: HeroSlide[]
}

export function HeroSection({ heroSections = [] }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (heroSections.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSections.length)
    }, 7000) // 7-second interval
    return () => clearInterval(timer)
  }, [heroSections.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSections.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSections.length) % heroSections.length)
  }

  if (heroSections.length === 0) {
    return (
      <section className="h-screen bg-gray-800 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome</h1>
          <p className="mt-2 text-lg">Content is being prepared.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images with Gentle Crossfade */}
      {heroSections.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40" />
        </div>
      ))}

      {/* Content - All Text Moves Together */}
      <div className="relative h-full flex items-center justify-center">
        {heroSections.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 transform translate-y-0"
                : index < currentSlide
                ? "opacity-0 transform -translate-y-16"
                : "opacity-0 transform translate-y-16"
            }`}
          >
            <div className="container mx-auto px-4 text-center text-white">
              {/* Main Title */}
              <h1 className="text-4xl md:text-7xl font-bold mb-6 font-serif">
                {slide.title}
              </h1>

              {/* Subtitle */}
              {slide.subtitle && (
                <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed">
                  {slide.subtitle}
                </p>
              )}

              {/* Star Rating (Static Example) */}
              <div className="flex items-center justify-center gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm">Luxury Hospitality Excellence</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {slide.ctaText && slide.ctaUrl && (
                  <Button
                    size="lg"
                    asChild
                    className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Link href={slide.ctaUrl}>{slide.ctaText}</Link>
                  </Button>
                )}
                {/* You can add a secondary CTA here if needed */}
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200"
                >
                  Book Your Stay
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {heroSections.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 backdrop-blur-sm transition-all duration-200 z-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 backdrop-blur-sm transition-all duration-200 z-10"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {heroSections.map((_, index) => (
              <button
                key={index}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "w-8 h-3 bg-white shadow-lg"
                    : "w-3 h-3 bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}