import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class FloorWithDesksAndSitsCountPresentation {
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
    sitDesks: number;
}
