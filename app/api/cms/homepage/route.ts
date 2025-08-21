// app/api/cms/homepage/route.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This API route correctly fetches all data for a given business unit.
// It can be used by client-side components, but will not be used by the main server-side HomePage.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessUnitId = searchParams.get("businessUnitId")

    if (!businessUnitId) {
      return new NextResponse("Missing businessUnitId parameter", { status: 400 })
    }

    const [
      heroSlides,
      testimonials,
      roomTypes,
      amenities,
      faqs,
      gallery,
      websiteConfig,
    ] = await Promise.all([
      prisma.heroSlide.findMany({ where: { businessUnitId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.testimonial.findMany({ where: { businessUnitId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.roomType_Model.findMany({ where: { businessUnitId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.amenity.findMany({ where: { businessUnitId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.fAQ.findMany({ where: { businessUnitId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.mediaItem.findMany({ where: { businessUnitId, category: 'gallery', isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.websiteConfiguration.findUnique({ where: { businessUnitId } }),
    ])

    return NextResponse.json({
      heroSlides,
      testimonials,
      accommodations: roomTypes, // Aliasing for consistency if needed by other clients
      amenities,
      faqs,
      gallery,
      websiteConfig,
    })
  } catch (error) {
    console.error("[HOMEPAGE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}