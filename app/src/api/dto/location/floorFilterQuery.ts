import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { LocationSitPlaceType } from "../../../location-service/contract/locationSitPlaceType";
import { BookingCustomFilterQuery } from "../booking/bookingCustomFilterQuery.dto";
import { BookingDailyFilterQuery } from "../booking/bookingDailyFilterQuery.dto";
import { BookingWeeklyFilterQuery } from "../booking/bookingWeeklyFilterQuery.dto";

export class FloorFilterQuery {
    @ApiPropertyOptional({ example: ["Power cord"] })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : new Array(value)))
    @IsString({ each: true })
    @IsArray()
    @ArrayNotEmpty()
    resources?: string[];

    @ApiPropertyOptional({ example: [LocationSitPlaceType.SIT_DESK] })
    @IsOptional()
    @IsEnum(LocationSitPlaceType, { each: true })
    sitPlaceType?: LocationSitPlaceType[];

    @ApiPropertyOptional({
        type: BookingCustomFilterQuery,
        example: {
            dateFrom: "2021-05-12",
            dateTo: "2021-05-12",
            timeFrom: "10:00",
            timeTo: "12:00"
        }
    })
    @Type(() => BookingCustomFilterQuery)
    @IsOptional()
    custom?: BookingCustomFilterQuery;

    @ApiPropertyOptional({
        type: BookingDailyFilterQuery,
        example: {
            timeFrom: "10:00",
            timeTo: "12:00"
        }
    })
    @Type(() => BookingDailyFilterQuery)
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
