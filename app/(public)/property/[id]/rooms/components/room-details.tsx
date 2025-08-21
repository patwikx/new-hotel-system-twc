import { Card } from "@/components/ui/card";
import { Bed, Users, Maximize, Waves, Sun, Eye } from "lucide-react";
import { RoomData } from "../[roomId]/page";


interface RoomDetailsProps {
  room: RoomData;
}

export function RoomDetails({ room }: RoomDetailsProps) {
    if (!room) return null;

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-foreground font-serif">Room Details</h2>
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Key Information</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /><span>Up to {room.maxOccupancy} guests</span></div>
                    <div className="flex items-center gap-3"><Bed className="h-5 w-5 text-primary" /><span>{room.bedConfiguration}</span></div>
                    {room.roomSize && <div className="flex items-center gap-3"><Maximize className="h-5 w-5 text-primary" /><span>{room.roomSize} sqm</span></div>}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Room Features</h3>
                <div className="space-y-4">
                    {room.hasBalcony && <div className="flex items-center gap-3"><Sun className="h-5 w-5 text-primary" /><span>Private Balcony</span></div>}
                    {room.hasOceanView && <div className="flex items-center gap-3"><Waves className="h-5 w-5 text-primary" /><span>Ocean View</span></div>}
                    {room.hasPoolView && <div className="flex items-center gap-3"><Eye className="h-5 w-5 text-primary" /><span>Pool View</span></div>}
                </div>
            </div>
        </div>
      </Card>
    </section>
  );
}