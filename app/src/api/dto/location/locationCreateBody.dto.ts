import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class LocationCreateBody {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    locationName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    locationAddress: string;

    @ApiProperty()
    @IsNotEmpty()
    country: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    region: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    timezone: string;

}
