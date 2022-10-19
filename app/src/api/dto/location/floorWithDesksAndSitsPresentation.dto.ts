import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class FloorWithDesksAndSitsPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;
    @ApiProperty({
        example: "First floor"
    })
    floorName: string;
    @ApiProperty()
    sitDesks: { id: string; name: string }[];
}
