import { FloorWithLocation } from "./floorWithLocation";

export interface LocationFloorWithAvailableDesksCount extends FloorWithLocation {
    sitDesks: number;
}
