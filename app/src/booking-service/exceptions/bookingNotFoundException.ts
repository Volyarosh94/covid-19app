export class BookingNotFoundException extends Error {
    constructor(bookingId: string) {
        super(`Booking ${bookingId} not found`);
    }
}
