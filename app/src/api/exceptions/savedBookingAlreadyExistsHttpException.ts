import { BadRequestException } from "@nestjs/common";

export class SavedBookingAlreadyExistsHttpException extends BadRequestException {
    constructor() {
        super("Saved booking already exists");
    }
}
