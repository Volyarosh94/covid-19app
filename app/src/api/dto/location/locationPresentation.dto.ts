import { ApiProperty } from "@nestjs/swagger";

export class LocationPresentation {
    @ApiProperty()
    id: string;
    @ApiProperty()
    locationName: string;
    @ApiProperty()
    locationAddress: string;
    @ApiProperty()
    businessHours: string;
    @ApiProperty()
    country: string;
    @ApiProperty()
    city: string;
    @ApiProperty()
    region: string;
    @ApiProperty()
    floors?: number;
    @ApiProperty()
    desks?: number;
    @ApiProperty()
    createdAt?: Date;
    @ApiProperty()
    timezone: string;
}
