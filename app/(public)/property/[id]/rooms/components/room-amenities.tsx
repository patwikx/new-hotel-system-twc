import { Badge } from "@/components/ui/badge";
import { Star, Wifi, Car, Utensils, Dumbbell } from "lucide-react";
import { RoomData } from "../[roomId]/page";


interface RoomAmenitiesProps {
  room: RoomData;
}

const amenityIcons: { [key: string]: React.ElementType } = {
  Wifi, Car, Utensils, Dumbbell
};

export function RoomAmenities({ room }: RoomAmenitiesProps) {
    if (!room || room.amenities.length === 0) return null;

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-foreground font-serif">What This Place Offers</h2>
      <div className="flex flex-wrap gap-3">
          {room.amenities.map((amenity) => {
            const Icon = amenity.icon ? (amenityIcons[amenity.icon] || Star) : Star;
            return (
                <Badge key={amenity.name} variant="outline" className="text-base p-3 border-gray-300">
                    <Icon className="h-5 w-5 mr-3 text-primary" />
                    {amenity.name}
                </Badge>
            )
          })}
      </div>
    </section>
  );
}