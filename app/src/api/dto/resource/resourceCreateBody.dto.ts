import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class ResourceCreateBody {
    @ApiProperty({
        example: "Power cord"
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: true
    })
    @IsBoolean()
    @IsNotEmpty()
    isAvailable: boolean;
}
