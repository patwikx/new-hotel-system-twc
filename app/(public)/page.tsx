// app/page.tsx

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

import { PublicHeader } from "@/components/homepage/public-header";
import { HeroSection } from "@/components/homepage/hero-section";
import { AccommodationsSection } from "@/components/homepage/accommodations";
import { AmenitiesSection } from "@/components/homepage/amenities-section";
import { TestimonialsSection } from "@/components/homepage/testimonials-section";
import { FAQSection } from "@/components/homepage/faq-section";
import { PublicFooter } from "@/components/homepage/public-footer";

async function getHomepageData() {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost";
    const cleanHost = host.replace(/:\d+$/, '');

    let businessUnit = await prisma.businessUnit.findFirst({
      where: { isActive: true, website: { contains: cleanHost, mode: 'insensitive' } },
      include: { websiteConfig: true },
    });

    if (!businessUnit) {
      businessUnit = await prisma.businessUnit.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        include: { websiteConfig: true },
      });
    }

    if (!businessUnit) throw new Error("No active business units found.");

    const [allHotels, rawHeroSlides, rawRoomTypes, amenities, testimonials, faqs] = await prisma.$transaction([
      prisma.businessUnit.findMany({ where: { isActive: true }, select: { id: true, displayName: true, city: true } }),
      prisma.heroSlide.findMany({ where: { businessUnitId: businessUnit.id, isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.roomType_Model.findMany({ where: { businessUnitId: businessUnit.id, isActive: true }, orderBy: { sortOrder: 'asc' }, include: { businessUnit: { select: { id: true, displayName: true } } } }),
      prisma.amenity.findMany({ where: { businessUnitId: businessUnit.id, isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.testimonial.findMany({ where: { businessUnitId: businessUnit.id, isActive: true }, orderBy: { sortOrder: 'asc' }, take: 6 }),
      prisma.fAQ.findMany({ where: { businessUnitId: businessUnit.id, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    ]);

    // --- FIX: Convert ALL Prisma.Decimal fields to standard numbers ---
    const heroSlides = rawHeroSlides.map(slide => ({
      ...slide,
      overlayOpacity: slide.overlayOpacity.toNumber(),
    }));

    const roomTypes = rawRoomTypes.map(room => ({
      ...room,
      baseRate: room.baseRate.toNumber(),
      roomSize: room.roomSize?.toNumber() || null,
      extraPersonRate: room.extraPersonRate?.toNumber() || null,
      extraChildRate: room.extraChildRate?.toNumber() || null,
    }));

    return { businessUnit, allHotels, heroSlides, roomTypes, amenities, testimonials, faqs, websiteConfig: businessUnit.websiteConfig };
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
        {data.amenities?.length > 0 && <AmenitiesSection amenities={data.amenities} />}
        {data.testimonials?.length > 0 && <TestimonialsSection testimonials={data.testimonials} />}
        {data.faqs?.length > 0 && <FAQSection faqs={data.faqs} />}
      </main>
    </>
  );
}