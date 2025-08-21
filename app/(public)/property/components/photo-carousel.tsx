// components/property/photo-carousel.tsx

"use client";

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';

interface PhotoCarouselProps {
  photos: string[];
  hotelName: string;
}

export function PhotoCarousel({ photos, hotelName }: PhotoCarouselProps) {
  // Initialize Embla Carousel with the autoplay plugin
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
      className="mb-16"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg" ref={emblaRef}>
        <div className="flex">
          {photos.map((photoUrl, index) => (
            <div className="relative h-[60vh] min-w-full flex-shrink-0" key={index}>
              <img
                src={photoUrl}
                alt={`${hotelName} photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}