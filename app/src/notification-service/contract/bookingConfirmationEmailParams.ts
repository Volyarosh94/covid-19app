import { BookingEntity } from "../../booking-service/entity/booking.entity";

export interface BookingConfirmationEmailParams {
    booking: BookingEntity;
    email: string;
    denyToken: string;
    approveToken: string;
}
