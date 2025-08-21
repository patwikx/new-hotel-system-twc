import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the property ID from the 'x-property-id' request header
    const propertyId = request.headers.get("x-property-id");

    if (!propertyId) {
      return new NextResponse("Missing x-property-id header", { status: 400 });
    }

    const businessUnit = await prisma.businessUnit.findUnique({
      where: { id: propertyId, isActive: true },
      include: {

         mediaLibrary: {
          where: { category: 'gallery', isActive: true },
          select: { url: true }, // We only need the image URLs
          orderBy: { createdAt: 'desc' }
        },
        roomTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            amenities: {
              select: {
                amenity: { select: { name: true, icon: true } }
              }
            },
          },
        },
      },
    });

    if (!businessUnit) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const response = {
      hotel: {
        id: businessUnit.id,
        name: businessUnit.displayName,
        description: businessUnit.description,
        address: businessUnit.address,
        city: businessUnit.city,
        gallery: businessUnit.mediaLibrary.map(item => item.url),
      },
      rooms: businessUnit.roomTypes.map((room) => ({
        id: room.id,
        name: room.displayName,
        type: room.type,
        description: room.description,
        pricePerNight: room.baseRate.toNumber(),
        capacity: room.maxOccupancy,
        bedConfiguration: room.bedConfiguration,
        imageUrl: room.primaryImage,
        amenities: room.amenities.map(a => a.amenity),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching property rooms:", error);
    return NextResponse.json({ error: "Failed to fetch property rooms" }, { status: 500 });
  }
}