import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class ResourcePresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;
    @ApiProperty({
        example: "Power cord"
    })
    name: string;
    @ApiProperty({
        example: uuid.v4()
    })
    locationId: string;
    @ApiProperty({
        example: true
    })
    isAvailable: boolean;

    @ApiProperty({
        example: new Date()
    })
    createdAt: Date;
}
