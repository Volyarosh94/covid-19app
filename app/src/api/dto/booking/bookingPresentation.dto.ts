import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import * as uuid from "uuid";
import { BOOKING_STATUS_TYPE } from "../../../booking-service/contract/bookingStatusType";
import { BookingType } from "../../../booking-service/contract/bookingType";
import { DeskPresentation } from "../desk/deskPresentation.dto";
import { FloorPresentation } from "../location/floorPresentation.dto";
import { LocationPresentation } from "../location/locationPresentation.dto";

export class BookingPresentation {
    @ApiProperty({ description: "booking id", example: uuid.v4() })
    id: string;

    @ApiProperty({ description: "booking start date", example: new Date(1615290326000) })
    dateFrom: string;

    @ApiProperty({ description: "booking end date", example: new Date(1615290326744) })
    dateTo: string;

    @ApiProperty({ description: "booking start time", example: "9:00 AM" })
    timeFrom: string;

    @ApiProperty({ description: "booking end time", example: "10:00 PM" })
    timeTo: string;

    @ApiProperty({ description: "creator id", example: uuid.v4() })
    userId: string;

    @ApiProperty({ description: "booking status", example: BOOKING_STATUS_TYPE.BOOKED })
    status: BOOKING_STATUS_TYPE;

    @ApiProperty({ type: LocationPresentation })
    location: LocationPresentation;

    @ApiProperty({ type: FloorPresentation })
    floor: FloorPresentation;

    @ApiProperty({ type: DeskPresentation })
    desk: DeskPresentation;

    @ApiPropertyOptional({
        example: "Mon"
    })
    weekDay?: string;

    @ApiPropertyOptional({
        example: true
    })
    selected?: boolean;

    @ApiPropertyOptional({ example: 3 })
    index?: number;

    @ApiProperty({
        example: BookingType.CUSTOM
    })
    type: BookingType;

    @ApiProperty({
        example: false
    })
    hasPassedQuestionnaire: boolean;
}
