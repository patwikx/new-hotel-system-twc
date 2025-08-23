import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/homepage/public-header";

// Import all the section components for this page
import { RoomDetails } from "../components/room-details";
import { RoomAmenities } from "../components/room-amenities";
import { RoomGallery } from "../components/room-gallery";
import { RoomBooking } from "../components/room-booking";
import { RoomHero } from "../components/room-hero";

/**
 * Server-side function to fetch all data for a single room type.
 */
async function getRoomData(roomId: string) {
  const roomType = await prisma.roomType_Model.findFirst({
    where: { id: roomId, isActive: true },
    include: {
      businessUnit: {
        include: { websiteConfig: true },
      },
      amenities: {
        select: {
          amenity: { select: { name: true, icon: true, category: true } },
        },
      },
    },
  });

  if (!roomType) return null;

  // Process the data, converting Decimals to numbers for the components
  return {
    ...roomType,
    baseRate: "toNumber" in roomType.baseRate ? roomType.baseRate.toNumber() : roomType.baseRate,
    roomSize:
      roomType.roomSize && "toNumber" in roomType.roomSize
        ? roomType.roomSize.toNumber()
        : roomType.roomSize ?? null,
    extraPersonRate:
      roomType.extraPersonRate && "toNumber" in roomType.extraPersonRate
        ? roomType.extraPersonRate.toNumber()
        : roomType.extraPersonRate ?? null,
    extraChildRate:
      roomType.extraChildRate && "toNumber" in roomType.extraChildRate
        ? roomType.extraChildRate.toNumber()
        : roomType.extraChildRate ?? null,
    amenities: roomType.amenities.map((a) => a.amenity), // Simplify amenities structure
  };
}

// Define a shared type for our processed room data
export type RoomData = Awaited<ReturnType<typeof getRoomData>>;

// Define the explicit type for the params object to be used by both functions
// Adding an index signature to resolve the Next.js type-checking issue
export type RoomParams = {
  id: string;
  roomId: string;
  [key: string]: string; // This resolves the build worker's type-checking issue
};

/**
 * This function pre-builds the room pages at build time for better performance.
 */
export async function generateStaticParams() {
  const rooms = await prisma.roomType_Model.findMany({
    where: { isActive: true },
    select: { id: true, businessUnitId: true },
  });

  return rooms.map((room) => ({
    id: room.businessUnitId,
    roomId: room.id,
  }));
}

export default async function RoomPage({
  params,
}: {
  // Next.js 15+: params is a Promise, so type it accordingly and await it
  params: Promise<RoomParams>;
}) {
  const { roomId } = await params; // ✅ await the promise to get route params

  const room = await getRoomData(roomId);

  if (!room) {
    notFound();
  }

  // Note: Header/Footer might need different data. For simplicity, we pass what we have.
  const layoutData = {
    businessUnit: room.businessUnit,
    allHotels: [], // This could be fetched separately if needed for the nav
    roomTypes: [],
    websiteConfig: room.businessUnit.websiteConfig,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader data={layoutData} />
      <main>
        <RoomHero room={room} />
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <RoomDetails room={room} />
              <RoomAmenities room={room} />
              <RoomGallery room={room} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <RoomBooking room={room} />
              </div>
            </div>
          </div>
        </div>
        {/* You can add a <SimilarRooms /> component here */}
      </main>
    </div>
  );
}
