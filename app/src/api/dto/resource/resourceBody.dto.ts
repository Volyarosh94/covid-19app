import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ResourceBody {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    tableLabel: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    sitDesk: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    standDesk: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    power: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lanPort: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    phone: string;
}
