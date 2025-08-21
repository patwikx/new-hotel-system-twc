"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Bed, Star, ArrowRight, Wifi, Car, Utensils, Phone, Mail, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import { PhotoCarousel } from "../components/photo-carousel";


// CHANGE: Updated Hotel interface to include a gallery
interface Hotel {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  gallery: string[] | null; // ADDED: Array of photo URLs
}

interface Room {
  id: string;
  name: string;
  type: string;
  description: string | null;
  pricePerNight: number;
  capacity: number;
  bedConfiguration: string | null;
  imageUrl: string | null;
  amenities: { name: string; icon: string | null }[];
}

interface PropertyData {
  hotel: Hotel;
  rooms: Room[];
}

const getAmenityIcon = (iconName: string | null) => {
  if (!iconName) return <Star className="h-4 w-4 text-amber-500" />;
  const iconMap: { [key: string]: React.ElementType } = { Wifi, Car, Utensils, Bed, Users };
  const Icon = iconMap[iconName] || Star;
  return <Icon className="h-4 w-4 text-amber-500" />;
};

export default function PropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [data, setData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/property/${propertyId}/rooms`, {
          headers: {
            'x-property-id': propertyId
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch: ${response.statusText}`);
        }
        const propertyData = await response.json();
        setData(propertyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId]);

  // Loading and Error states remain the same...
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your perfect stay...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg max-w-md"
        >
          <h1 className="text-2xl font-bold text-slate-900 font-serif mb-4">Property Not Found</h1>
          <p className="text-slate-600 mb-6">{error || "The requested property could not be found."}</p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }


  const { hotel, rooms } = data;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative pt-24 md:pt-36">
        <div className="container mx-auto px-6 py-12">
          <motion.header 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            {/* Header content remains the same... */}
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold font-serif text-slate-900 mb-6 tracking-tight"
              >
                {hotel.name}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center justify-center gap-3 text-slate-600 mb-8"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-500" />
                  <span className="text-xl font-medium">{hotel.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="ml-2 text-sm text-slate-500">4.8 (324 reviews)</span>
                </div>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
              >
                {hotel.description || "Experience luxury and comfort in our beautifully appointed accommodations, where every detail is designed to exceed your expectations."}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-6 mt-8"
              >
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-amber-500" />
                  <span>+63 123 456 7890</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-amber-500" />
                  <span>reservations@hotel.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>24/7 Concierge</span>
                </div>
              </motion.div>
            </div>
          </motion.header>

          {/* ADDED: Conditionally render the photo carousel */}
          {hotel.gallery && hotel.gallery.length > 0 && (
            <PhotoCarousel photos={hotel.gallery} hotelName={hotel.name} />
          )}

          <section>
            {/* The rest of the accommodations section remains the same... */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">
                Our Accommodations
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover our carefully curated selection of rooms and suites, each offering unique amenities and unparalleled comfort.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-slate-200 hover:border-slate-300 relative h-full">
                    <div className="relative h-72 overflow-hidden">
                      <img 
                        src={room.imageUrl || `/placeholder.svg`} 
                        alt={room.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/95 backdrop-blur-sm border border-white/20 text-slate-900 font-bold text-base px-3 py-1">
                          ₱{room.pricePerNight.toLocaleString()}
                          <span className="text-xs font-normal ml-1">/night</span>
                        </Badge>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/20 text-white font-medium">
                          {room.type}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                          <Users className="h-4 w-4 text-slate-700" />
                          <span className="text-sm font-medium text-slate-700">{room.capacity} guests</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                          <Bed className="h-4 w-4 text-slate-700" />
                          <span className="text-sm font-medium text-slate-700">{room.bedConfiguration}</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <CardTitle className="text-2xl text-slate-900 font-serif mb-3 group-hover:text-slate-700 transition-colors">
                        {room.name}
                      </CardTitle>
                      <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                        {room.description || "Experience luxury and comfort in this beautifully appointed room with premium amenities and stunning views."}
                      </p>
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Room Amenities</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {room.amenities.slice(0, 4).map((amenity) => (
                            <div key={amenity.name} className="flex items-center gap-2 text-xs text-slate-600">
                              {getAmenityIcon(amenity.icon)}
                              <span className="font-medium">{amenity.name}</span>
                            </div>
                          ))}
                        </div>
                        {room.amenities.length > 4 && (
                          <p className="text-xs text-slate-500 mt-2">
                            +{room.amenities.length - 4} more amenities
                          </p>
                        )}
                      </div>
                      <Button 
                        asChild 
                        className="w-full group/btn bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg mt-auto"
                        size="lg"
                      >
                        <Link href={`/property/${propertyId}/rooms/${room.id}`}>
                          View Room Details & Book
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </Link>
                      </Button>
                    </CardContent>
                    <div className="absolute top-0 left-0 w-12 h-12 bg-slate-100 transform -rotate-45 -translate-x-6 -translate-y-6 group-hover:bg-slate-200 transition-colors duration-300" />
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Bottom CTA section remains the same... */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-slate-900 font-serif mb-4">
                Ready to Experience Luxury?
              </h3>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Our dedicated concierge team is available around the clock to assist with reservations, 
                special requests, and ensuring your stay exceeds all expectations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="font-medium">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 font-medium">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Reservations
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}