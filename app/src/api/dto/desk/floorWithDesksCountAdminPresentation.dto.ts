import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class FloorWithDesksCountAdminPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;

    @ApiProperty({
        example: "First Floor"
    })
    floorName: string;

    @ApiProperty({
        example: 5
    })
    availableDesks: number;

    @ApiProperty({
        example: 0
    })
    assignedDesks: number;

    @ApiProperty({
        example: 5
    })
    totalDesks: number;
}
