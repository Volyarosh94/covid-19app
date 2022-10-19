import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CoordinateBody {
    @ApiProperty({
        example: 10
    })
    @IsNotEmpty()
    @IsNumber()
    x: number;
    @ApiProperty({
        example: 15
    })
    @IsNotEmpty()
    @IsNumber()
    y: number;
}
