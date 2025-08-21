import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const hotels = await prisma.businessUnit.findMany({
      where: {
        isActive: true, // It's good practice to only fetch active properties
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        propertyType: true,
        // CORRECTED: Replaced non-existent 'location' with specific address fields
        address: true,
        city: true,
        country: true,
        // CORRECTED: Replaced non-existent 'imageUrl' with the 'logo' field from your schema
        logo: true,
        phone: true,
        email: true,
        website: true,
        // CORRECTED: The relation in your schema is 'roomTypes', not 'accommodations'
        roomTypes: {
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            description: true,
            // CORRECTED: Replaced generic fields with specific fields from your schema
            maxOccupancy: true,
            bedConfiguration: true,
            baseRate: true,
            primaryImage: true,
            images: true, // This field holds the gallery images for the room type
            // CORRECTED: Properly selecting through the join table to get amenity details
            amenities: {
              select: {
                amenity: {
                  select: {
                    name: true,
                    description: true,
                    icon: true,
                    category: true,
                  },
                },
              },
            },
          },
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        // CORRECTED: The relation in your schema is 'services', not 'hotelServices'
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            basePrice: true,
            // REMOVED: 'currency' and 'location' do not exist on the Service model
          },
          where: {
            isActive: true,
          },
        },
        _count: {
          select: {
            rooms: true,
            guests: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(hotels)
  } catch (error) {
    console.error("Error fetching hotels:", error)
    return NextResponse.json(
      { error: "Failed to fetch hotels" },
      { status: 500 }
    )
  }
}