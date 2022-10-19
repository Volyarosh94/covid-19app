import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { BookingOrderType } from "../../../booking-service/contract/bookingOrderType";
import * as uuid from "uuid";
import * as moment from "moment";

export class BookingFilterQuery {
    @ApiPropertyOptional({
        example: uuid.v4()
    })
    @IsOptional()
    @IsUUID()
    locationId?: string;

    @ApiPropertyOptional({
        example: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @ApiPropertyOptional({
        example: 10
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;

    @ApiPropertyOptional({
        example: BookingOrderType.ASC
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }: { value: string }) => value.toUpperCase())
    order?: BookingOrderType;

    @ApiPropertyOptional({
        example: moment(new Date()).format("YYYY-MM-DD")
    })
    @IsOptional()
    @IsDateString({ strict: true })
    dateFrom?: Date;
}
