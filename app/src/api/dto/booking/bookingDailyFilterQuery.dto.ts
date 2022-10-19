import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class BookingDailyFilterQuery {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    timeFrom: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    timeTo: string;
}
