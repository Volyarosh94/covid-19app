import { LocationEntity } from "../entity/location.entity";

export interface FloorWithLocation {
    id: string;
    floorName: string;
    location: LocationEntity;
}
