import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class BookingCustomFilterQuery {
    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    dateFrom: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    dateTo: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    timeFrom: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    timeTo: string;
}
