import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class FloorPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;
    @ApiProperty({
        example: "Floor_1"
    })
    floorName: string;
    @ApiProperty({ example: uuid.v4() })
    locationId: string;
}
