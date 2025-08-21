// app/api/property/[id]/rooms/[roomId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  // We'll keep the context argument for correct function signature, but we won't use it.
  context: { params: { id: string; roomId: string } }
) {
  try {
    // ✅ Bypassing context.params by parsing the URL directly. This is a more robust fix.
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/'); // e.g., ['', 'api', 'property', 'abc', 'rooms', 'xyz']

    // The IDs are the 4th and 6th segments in this specific path
    const businessUnitId = pathSegments[3];
    const roomTypeId = pathSegments[5];

    // Add a check to ensure we got the IDs correctly
    if (!businessUnitId || !roomTypeId) {
        return NextResponse.json({ error: "Could not parse property or room ID from URL." }, { status: 400 });
    }

    // The rest of your logic remains exactly the same
    const roomType = await prisma.roomType_Model.findUnique({
      where: {
        id: roomTypeId,
        businessUnitId: businessUnitId,
      },
      // ... include clauses are the same
      include: {
        businessUnit: {
          select: {
            id: true,
            displayName: true,
            city: true,
            address: true,
          },
        },
        amenities: {
          select: {
            amenity: {
              select: {
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Room not found for this property" },
        { status: 404 }
      );
    }
    
    // ... the rest of your response mapping is the same
    const roomDetail = {
      id: roomType.id,
      name: roomType.displayName,
      description: roomType.description,
      pricePerNight: roomType.baseRate.toNumber(),
      capacity: roomType.maxOccupancy,
      bedConfiguration: roomType.bedConfiguration,
      roomSize: roomType.roomSize?.toNumber() ?? null,
      primaryImage: roomType.primaryImage,
      gallery: roomType.images,
      amenities: roomType.amenities.map((a) => a.amenity),
      businessUnit: {
        id: roomType.businessUnit.id,
        name: roomType.businessUnit.displayName,
        address: roomType.businessUnit.address,
        city: roomType.businessUnit.city,
      },
    };

    return NextResponse.json(roomDetail);

  } catch (error) {
    console.error("Error fetching room details:", error);
    return NextResponse.json(
      { error: "Failed to fetch room details" },
      { status: 500 }
    );
  }
}