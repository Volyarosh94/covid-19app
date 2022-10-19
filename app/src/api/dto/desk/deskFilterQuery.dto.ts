import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsOptional } from "class-validator";
import { BookingCustomFilterQuery } from "../booking/bookingCustomFilterQuery.dto";
import { BookingDailyFilterQuery } from "../booking/bookingDailyFilterQuery.dto";
import { BookingWeeklyFilterQuery } from "../booking/bookingWeeklyFilterQuery.dto";

export class DeskFilterQuery {
    @ApiPropertyOptional({
        type: BookingCustomFilterQuery,
        example: {
            dateFrom: "2021-05-12",
            dateTo: "2021-05-12",
            timeFrom: "10:00",
            timeTo: "12:00"
        }
    })
    @IsOptional()
    custom?: BookingCustomFilterQuery;

    @ApiPropertyOptional({
        type: BookingDailyFilterQuery,
        example: {
            timeFrom: "10:00",
            timeTo: "12:00"
        }
    })
    @IsOptional()
    daily?: BookingDailyFilterQuery;

    @ApiPropertyOptional({
        type: [BookingWeeklyFilterQuery],
        example: [
            {
                weekDay: "Mon",
                timeFrom: "10:00",
                timeTo: "12:00"
            }
        ]
    })
    @IsOptional()
    @IsArray()
    @Transform(({ value }) => (Array.isArray(value) ? value : new Array(JSON.parse(value))))
    weekly?: BookingWeeklyFilterQuery[];
}
