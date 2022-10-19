import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class FloorMapPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;
    @ApiProperty()
    buffer: string;
    @ApiProperty()
    encoding: string;
    @ApiProperty()
    fieldname: string;
    @ApiProperty()
    mimetype: string;
    @ApiProperty()
    originalname: string;
    @ApiProperty()
    size: number;
    @ApiProperty()
    floorId: string;
}
