import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IBookingService } from "../../booking-service/IBookingService";
import { BOOKING_SERVICE } from "../../booking-service/ioc";
import { BookingPresentation } from "../dto/booking/bookingPresentation.dto";
import { BookingPresentationMapper } from "../mappers/bookingPresentation.mapper";

@ApiTags("Bookings")
@Controller("bookings")
export class BookingApprovalController {
    constructor(
        @Inject(BOOKING_SERVICE)
        private readonly bookingService: IBookingService,
        private readonly mapper: BookingPresentationMapper
    ) {}

    @Get("confirm")
    @ApiOperation({ summary: "Confirm booking" })
    @ApiOkResponse({ type: BookingPresentation })
    async confirmBooking(@Query("token") token: string): Promise<BookingPresentation> {
        const booking = await this.bookingService.confirmBooking(token);
        return this.mapper.mapBookingToPresentation(booking);
    }
}
