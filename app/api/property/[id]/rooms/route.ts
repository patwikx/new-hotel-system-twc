// app/api/property/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Type-guard for values that expose a `toNumber()` method (Prisma Decimal-like).
 * This avoids using `any` while still allowing us to call toNumber() safely.
 */
function hasToNumberMethod(v: unknown): v is { toNumber: () => number } {
  return typeof v === "object" && v !== null && "toNumber" in v && typeof (v as { toNumber?: unknown }).toNumber === "function";
}

/** Safely convert Decimal-like / numeric / string values to number without using `any`. */
function toNumberSafe(v: unknown): number | null {
  if (hasToNumberMethod(v)) {
    return v.toNumber();
  }
  if (typeof v === "number") {
    return v;
  }
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const propertyId = request.headers.get("x-property-id");

    if (!propertyId) {
      return new NextResponse("Missing x-property-id header", { status: 400 });
    }

    // Use findFirst when filtering by non-unique combination (id + isActive)
    const businessUnit = await prisma.businessUnit.findFirst({
      where: { id: propertyId, isActive: true },
      include: {
        mediaLibrary: {
          where: { category: "gallery", isActive: true },
          select: { url: true },
          orderBy: { createdAt: "desc" },
        },
        roomTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            amenities: {
              select: {
                amenity: { select: { name: true, icon: true } },
              },
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
        gallery: businessUnit.mediaLibrary.map((item) => item.url),
      },
      rooms: businessUnit.roomTypes.map((room) => ({
        id: room.id,
        name: room.displayName,
        type: room.type,
        description: room.description,
        pricePerNight: toNumberSafe(room.baseRate),
        capacity: room.maxOccupancy,
        bedConfiguration: room.bedConfiguration,
        imageUrl: room.primaryImage,
        amenities: room.amenities.map((a) => a.amenity),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching property rooms:", error);
    return NextResponse.json({ error: "Failed to fetch property rooms" }, { status: 500 });
  }
}
