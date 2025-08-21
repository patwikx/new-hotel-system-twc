"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type RoomData } from "../[roomId]/page"; // Adjust path if needed

interface RoomHeroProps {
  room: RoomData;
}

export function RoomHero({ room }: RoomHeroProps) {
  // --- FIX: Hooks must be called at the top level, before any conditions ---
  const [currentImage, setCurrentImage] = useState(0);

  // The conditional return now happens *after* all hooks have been called.
  if (!room) {
    return null;
  }

  const galleryImages = [room.primaryImage, ...room.images].filter(Boolean) as string[];

  const nextImage = () => {
    if (galleryImages.length > 0) {
      setCurrentImage((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const prevImage = () => {
    if (galleryImages.length > 0) {
      setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  if (galleryImages.length === 0) {
      // Fallback if no images are available
      return (
        <section className="relative h-[60vh] bg-gray-800 flex items-end">
            <div className="container mx-auto px-4 pb-12 text-white">
                <Badge variant="secondary" className="mb-4">{room.type}</Badge>
                <h1 className="text-4xl md:text-6xl font-bold font-serif drop-shadow-md">{room.displayName}</h1>
                <p className="text-xl mt-2 text-white/90 drop-shadow">{room.description}</p>
            </div>
        </section>
      )
  }

  return (
    <section className="relative">
      <div className="relative h-[60vh] overflow-hidden bg-gray-800">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentImage ? "opacity-100" : "opacity-0"}`}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}/>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {galleryImages.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12" onClick={prevImage}><ChevronLeft /></Button>
            <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12" onClick={nextImage}><ChevronRight /></Button>
          </>
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 text-white">
            <Badge variant="secondary" className="mb-4">{room.type}</Badge>
            <h1 className="text-4xl md:text-6xl font-bold font-serif drop-shadow-md">{room.displayName}</h1>
            <p className="text-xl mt-2 text-white/90 drop-shadow">{room.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}