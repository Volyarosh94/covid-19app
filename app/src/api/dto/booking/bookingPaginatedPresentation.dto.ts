import { ApiProperty } from "@nestjs/swagger";
import { BookingPresentation } from "./bookingPresentation.dto";

export class BookingsPaginatedPresentation {
    @ApiProperty()
    page: number;
    @ApiProperty()
    limit: number;
    @ApiProperty()
    totalCount: number;
    @ApiProperty({ type: [BookingPresentation] })
    bookings: BookingPresentation[];
}
