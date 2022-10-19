import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class BookingWeeklyFilterQuery {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    weekDay: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    timeFrom: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    timeTo: string;
}
