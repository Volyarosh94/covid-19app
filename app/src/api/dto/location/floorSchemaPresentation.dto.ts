import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";
import { DrawingPresentation } from "./drawingPresentation.dto";
import { MapSize } from "./mapSize.dto";

export class FloorSchemaPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;
    @ApiProperty({
        example: uuid.v4()
    })
    floorId: string;
    @ApiProperty({
        example: "First floor"
    })
    floorName: string;
    @ApiProperty({ type: MapSize })
    size: MapSize;
    @ApiProperty({
        example: `api/locations/${uuid.v4()}/floor-map`
    })
    mapUrl: string;
    @ApiProperty({
        type: [DrawingPresentation]
    })
    drawings: DrawingPresentation[];
}
