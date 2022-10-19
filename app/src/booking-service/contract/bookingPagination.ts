import { BookingEntity } from "../entity/booking.entity";

export interface BookingPagination {
    bookings: BookingEntity[];
    page: number;
    limit: number;
    totalCount: number;
}
