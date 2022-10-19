import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import * as uuid from "uuid";

export class SavedDeskCreateBody {
    @ApiProperty({
        example: uuid.v4()
    })
    @IsUUID()
    @IsNotEmpty()
    locationId: string;

    @ApiProperty({
        example: uuid.v4()
    })
    @IsUUID()
    @IsNotEmpty()
    floorId: string;

    @ApiProperty({
        example: 115
    })
    @IsNotEmpty()
    @IsString()
    deskId: string;
}
