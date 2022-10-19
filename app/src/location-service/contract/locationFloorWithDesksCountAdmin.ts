import { FloorWithLocation } from "./floorWithLocation";

export interface LocationFloorWithDesksCountAdmin extends FloorWithLocation {
    availableDesks: number;
    assignedDesks: number;
    totalDesks: number
}
