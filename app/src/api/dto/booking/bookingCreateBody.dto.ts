import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import * as moment from "moment";
import * as uuid from "uuid";

export class BookingCreateBody {
    @ApiPropertyOptional({
        description: "booking start date",
        example: moment(1615290326000).format("YYYY-MM-DD")
    })
    @IsOptional()
    @IsDateString({ strict: true })
    @IsNotEmpty()
    dateFrom: string;

    @ApiPropertyOptional({
        description: "booking end date",
        example: moment(1615290326000).format("YYYY-MM-DD")
    })
    @IsOptional()
    @IsDateString({ strict: true })
    @IsNotEmpty()
    dateTo: string;

    @ApiProperty({
        description: "booking start time",
        example: "9:00"
    })
    @IsString()
    @IsNotEmpty()
    timeFrom: string;

    @ApiProperty({
        description: "booking end time",
        example: "10:00"
    })
    @IsString()
    @IsNotEmpty()
    timeTo: string;

    @ApiProperty({ example: uuid.v4() })
    @IsString()
    @IsNotEmpty()
    deskId: string;

    @ApiPropertyOptional({
        example: "Mon"
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    weekDay: string;

    @ApiPropertyOptional({
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @IsNotEmpty()
    selected: boolean;

    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    index: number;
}
