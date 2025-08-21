import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/homepage/public-header";
import { PublicFooter } from "@/components/homepage/public-footer";

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
  const roomType = await prisma.roomType_Model.findUnique({
    where: { id: roomId, isActive: true },
    include: {
      businessUnit: {
        include: { websiteConfig: true }
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
    baseRate: roomType.baseRate.toNumber(),
    roomSize: roomType.roomSize?.toNumber() ?? null,
    extraPersonRate: roomType.extraPersonRate?.toNumber() ?? null,
    extraChildRate: roomType.extraChildRate?.toNumber() ?? null,
    amenities: roomType.amenities.map(a => a.amenity), // Simplify amenities structure
  };
}

// Define a shared type for our processed room data
export type RoomData = Awaited<ReturnType<typeof getRoomData>>;

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

export default async function RoomPage({ params }: { params: { id: string, roomId: string } }) {
  const room = await getRoomData(params.roomId);

  if (!room) {
    notFound();
  }
  
  // Note: Header/Footer might need different data. For simplicity, we pass what we have.
  const layoutData = {
      businessUnit: room.businessUnit, 
      allHotels: [], // This could be fetched separately if needed for the nav
      roomTypes: [], 
      websiteConfig: room.businessUnit.websiteConfig
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