// app/api/property/[id]/rooms/[roomId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type RouteParams = {
  id: string;
  roomId: string;
  [key: string]: string;
};

/** Type guard for Decimal-like objects exposing toNumber() (no `any`). */
function hasToNumberMethod(v: unknown): v is { toNumber: () => number } {
  return typeof v === "object" && v !== null && "toNumber" in v && typeof (v as { toNumber?: unknown }).toNumber === "function";
}

/** Safely convert Decimal-like / numeric / string value to number without using `any`. */
function toNumberSafe(v: unknown): number | null {
  if (hasToNumberMethod(v)) return v.toNumber();
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Strongly-typed payload including relations we actually include in the query.
 * Keep this in sync with the `include` block below.
 */
type RoomTypeWithRelations = Prisma.RoomType_ModelGetPayload<{
  include: {
    businessUnit: {
      select: { id: true; displayName: true; address: true; city: true };
    };
    amenities: {
      select: { amenity: { select: { name: true; icon: true } } };
    };
    // images and primaryImage are scalar fields (String / String[]), not relations,
    // so we do NOT include them here (they come back as part of the base model).
  };
}>;

export async function GET(
  request: Request,
  ctx: { params: Promise<RouteParams> } // Next.js 15+: params is a Promise
) {
  try {
    const { id, roomId } = await ctx.params;

    const businessUnitId = id;
    const roomTypeId = roomId;

    if (!businessUnitId || !roomTypeId) {
      return NextResponse.json({ error: "Property or room ID not provided in URL." }, { status: 400 });
    }

    const roomType = await prisma.roomType_Model.findFirst({
      where: {
        id: roomTypeId,
        businessUnitId,
      },
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
        // NOTE: do NOT include `images` or `primaryImage` here — they are scalar fields on the model
      },
    });

    if (!roomType) {
      return NextResponse.json({ error: "Room not found for this property" }, { status: 404 });
    }

    // Narrow to payload type that includes relations so TS knows businessUnit exists
    const roomTyped = roomType as RoomTypeWithRelations;

    const roomDetail = {
      id: roomTyped.id,
      name: roomTyped.displayName,
      description: roomTyped.description,
      pricePerNight: toNumberSafe(roomTyped.baseRate),
      capacity: roomTyped.maxOccupancy,
      bedConfiguration: roomTyped.bedConfiguration,
      roomSize: toNumberSafe(roomTyped.roomSize),
      // primaryImage and images are scalar fields on the model (String? and String[])
      primaryImage: roomTyped.primaryImage ?? null,
      gallery: roomTyped.images ?? [],
      amenities: roomTyped.amenities.map((a) => a.amenity),
      businessUnit: {
        id: roomTyped.businessUnit.id,
        name: roomTyped.businessUnit.displayName,
        address: roomTyped.businessUnit.address,
        city: roomTyped.businessUnit.city,
      },
    };

    return NextResponse.json(roomDetail);
  } catch (error) {
    console.error("Error fetching room details:", error);
    return NextResponse.json({ error: "Failed to fetch room details" }, { status: 500 });
  }
}
