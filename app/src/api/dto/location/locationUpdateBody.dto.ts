import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LocationUpdateBody {
    @ApiPropertyOptional()
    @IsString()
    locationName?: string;

    @ApiPropertyOptional()
    @IsString()
    locationAddress?: string;

    @ApiProperty()
    @IsString()
    city: string;

    @ApiProperty()
    @IsString()
    country: string;

    @ApiProperty()
    @IsString()
    region: string;

    @ApiProperty()
    @IsString()
    timezone: string;
}
