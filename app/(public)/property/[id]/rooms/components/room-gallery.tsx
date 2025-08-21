"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { type RoomData } from "../[roomId]/page"; // Adjust path if needed


interface RoomGalleryProps {
  room: RoomData;
}

export function RoomGallery({ room }: RoomGalleryProps) {
  // --- FIX: Moved the useState hook to the top of the component ---
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Conditional returns now happen *after* all hooks have been called.
  if (!room) {
    return null;
  }

  const galleryImages = [room.primaryImage, ...room.images].filter(Boolean) as string[];

  if (galleryImages.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => setSelectedImage(prev => (prev! + 1) % galleryImages.length);
  const prevImage = () => setSelectedImage(prev => (prev! - 1 + galleryImages.length) % galleryImages.length);

  return (
    <section>
      <h2 className="text-3xl font-bold text-foreground font-serif mb-6">Photo Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {galleryImages.slice(0, 6).map((image, index) => (
          <div key={index} className="relative group cursor-pointer overflow-hidden rounded-lg aspect-[4/3]" onClick={() => openLightbox(index)}>
            <div className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url(${image})` }}/>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <img src={galleryImages[selectedImage]} alt={`${room.displayName} gallery image ${selectedImage + 1}`} className="max-w-[90vw] max-h-[90vh] object-contain" />
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 h-12 w-12" onClick={closeLightbox}><X /></Button>
            <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12" onClick={prevImage}><ChevronLeft /></Button>
            <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12" onClick={nextImage}><ChevronRight /></Button>
        </div>
      )}
    </section>
  );
}