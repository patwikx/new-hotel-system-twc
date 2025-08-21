// app/page.tsx

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/homepage/hero-section";
import { AccommodationsSection } from "@/components/homepage/accommodations";
import { AmenitiesSection } from "@/components/homepage/amenities-section";
import { TestimonialsSection } from "@/components/homepage/testimonials-section";
import { FAQSection } from "@/components/homepage/faq-section";
import { SpecialOffersSection } from "@/components/homepage/special-offers-section";
import { EventsSection } from "@/components/homepage/events-section";
import { OperatingHours, RestaurantsSection } from "@/components/homepage/restaurant-section";

async function getHomepageData() {
  try {
    // We are now fetching data for a general homepage that highlights all properties.
    // The previous logic for finding a single business unit by host is no longer needed.
    
    // Fetch a curated selection from across all business units.
    const [
      allHotels, 
      rawHeroSlides, 
      rawRoomTypes, 
      amenities, 
      testimonials, 
      faqs, 
      rawRestaurants, 
      rawSpecialOffers, 
      rawEvents
    ] = await prisma.$transaction([
      prisma.businessUnit.findMany({ where: { isActive: true }, select: { id: true, displayName: true, city: true } }),
      // Fetch a limited number of hero slides from all business units.
      prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 6 }),
      // Fetch a limited number of featured accommodations from all business units.
      prisma.roomType_Model.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 6, include: { businessUnit: { select: { id: true, displayName: true } } } }),
      // Fetch all active amenities (assuming amenities are the same across properties).
      prisma.amenity.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      // Fetch a limited number of testimonials from all business units.
      prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 6 }),
      // Fetch a limited number of FAQs from all business units.
      prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 6 }),
      // Fetch restaurants with menu items for the featured restaurant
      prisma.restaurant.findMany({ 
        where: { isActive: true, isPublished: true }, 
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
        take: 6,
        include: {
          menuCategories: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              items: {
                where: { isAvailable: true, isRecommended: true }, // Only get recommended items
                orderBy: { sortOrder: 'asc' },
                take: 8 // Limit menu items per restaurant
              }
            }
          }
        }
      }),
      // Fetch a limited number of active special offers from all business units.
      prisma.specialOffer.findMany({ where: { isPublished: true, status: 'ACTIVE', validTo: { gte: new Date() } }, orderBy: { sortOrder: 'asc' }, take: 6 }),
      // Fetch a limited number of confirmed events from all business units.
      prisma.event.findMany({ where: { isPublished: true, status: 'CONFIRMED', startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 6 }),
    ]);

    // --- DATA TRANSFORMATION ---
    // Convert all Prisma.Decimal and Date fields to match the component interfaces.

    const heroSlides = rawHeroSlides.map(slide => ({
      ...slide,
      overlayOpacity: slide.overlayOpacity.toNumber(),
    }));

    const roomTypes = rawRoomTypes.map(room => ({
      ...room,
      baseRate: room.baseRate.toNumber(),
      roomSize: room.roomSize?.toNumber() ?? undefined,
      extraPersonRate: room.extraPersonRate?.toNumber() ?? undefined,
      extraChildRate: room.extraChildRate?.toNumber() ?? undefined,
    }));

    const restaurants = rawRestaurants.map(restaurant => ({
      ...restaurant,
      operatingHours: restaurant.operatingHours as OperatingHours, 
      averageMeal: restaurant.averageMeal?.toNumber() ?? undefined,
      // Transform menu items and handle null values
      menuItems: restaurant.menuCategories.flatMap(category => 
        category.items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description ?? undefined, // FIX: Convert null to undefined
          price: item.price.toNumber(),
          currency: item.currency,
          image: item.image ?? undefined, // FIX: Convert null to undefined
          allergens: item.allergens,
          dietary: item.dietary,
          isSignature: item.isSignature,
          isRecommended: item.isRecommended,
          spiceLevel: item.spiceLevel ?? undefined, // FIX: Convert null to undefined
        }))
      ),
    }));

    const specialOffers = rawSpecialOffers.map(offer => ({
      ...offer,
      subtitle: offer.subtitle ?? undefined,
      shortDesc: offer.shortDesc ?? undefined,
      featuredImage: offer.featuredImage ?? undefined,
      originalPrice: offer.originalPrice?.toNumber() ?? undefined,
      offerPrice: offer.offerPrice.toNumber(),
      savingsAmount: offer.savingsAmount?.toNumber() ?? undefined,
      savingsPercent: offer.savingsPercent ?? undefined,
      validFrom: offer.validFrom.toISOString(),
      validTo: offer.validTo.toISOString(),
      maxNights: offer.maxNights ?? undefined,
    }));

    const events = rawEvents.map(event => ({
      ...event,
      shortDesc: event.shortDesc ?? undefined,
      ticketPrice: event.ticketPrice?.toNumber() ?? undefined,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      startTime: event.startTime ?? undefined,
      endTime: event.endTime ?? undefined,
      venueDetails: event.venueDetails ?? undefined,
      venueCapacity: event.venueCapacity ?? undefined,
      maxAttendees: event.maxAttendees ?? undefined,
      hostName: event.hostName ?? undefined,
      contactInfo: event.contactInfo ?? undefined,
      featuredImage: event.featuredImage ?? undefined,
      hostBio: event.hostBio ?? undefined,
    }));

    // Pass the list of all hotels for any navigation or context needs.
    return { 
      allHotels, 
      heroSlides, 
      roomTypes, 
      amenities, 
      testimonials, 
      faqs, 
      restaurants, 
      specialOffers, 
      events,
    };

  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomepageData();

  if (!data) {
    return <div>Content is currently unavailable.</div>;
  }

  return (
    <>
      <main className="min-h-screen">
        {data.heroSlides?.length > 0 && <HeroSection heroSections={data.heroSlides} />}
        {data.roomTypes?.length > 0 && <AccommodationsSection accommodations={data.roomTypes} />}
        {data.restaurants?.length > 0 && <RestaurantsSection restaurants={data.restaurants} />}
        {data.specialOffers?.length > 0 && <SpecialOffersSection specialOffers={data.specialOffers} />}
        {data.events?.length > 0 && <EventsSection events={data.events} />}
        {data.testimonials?.length > 0 && <TestimonialsSection testimonials={data.testimonials} />}
        {data.faqs?.length > 0 && <FAQSection faqs={data.faqs} />}
      </main>
    </>
  );
}
