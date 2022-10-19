import { Size } from "./floorSchema";

export interface FloorCreateRequest {
    floorName: string;
    mapSize: Size;
}
