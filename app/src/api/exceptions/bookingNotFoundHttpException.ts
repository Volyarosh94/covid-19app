import { NotFoundException } from "@nestjs/common";

export class BookingNotFoundHttpException extends NotFoundException {
    constructor() {
        super("Booking not found");
    }
}
