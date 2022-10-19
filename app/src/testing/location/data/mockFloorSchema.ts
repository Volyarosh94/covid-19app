import { DrawingType } from "../../../location-service/contract/floorSchema";
import { FloorSchemaEntity } from "../../../location-service/entity/floorSchema.entity";
import { createMockFloorEntity } from "./mockLocationData";

export const mockFloorSchemaEntityWithDrawings: FloorSchemaEntity = {
    id: "schema_id",
    floor: createMockFloorEntity(),
    schema: {
        id: "schema_id",
        drawings: [
            {
                deskId: "desk_id",
                coordinates: [
                    {
                        x: 10,
                        y: 15
                    }
                ],
                fill: "color_1",
                line: "color_2",
                name: "Desk 1",
                sectionId: 1,
                type: DrawingType.DESK
            }
        ],
        floorName: "Floor_1",
        floorId: "floor_id",
        mapUrl: "/api/locations/floor_id/floor-map",
        size: {
            height: 150,
            width: 50
        }
    }
};

export const mockFloorSchemaEntityWithEmptyDrawings: FloorSchemaEntity = {
    id: "schema_id",
    floor: createMockFloorEntity(),
    schema: {
        id: "schema_id",
        drawings: [],
        floorName: "Floor_1",
        floorId: "floor_id",
        mapUrl: "/api/locations/floor_id/floor-map",
        size: {
            height: 150,
            width: 50
        }
    }
};
