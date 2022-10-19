import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class MapSize {
    @ApiProperty({
        example: 150
    })
    @IsNumber()
    @IsNotEmpty()
    width: number;

    @ApiProperty({
        example: 350
    })
    @IsNumber()
    @IsNotEmpty()
    height: number;
}
