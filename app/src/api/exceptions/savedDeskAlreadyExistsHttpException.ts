import { BadRequestException } from "@nestjs/common";

export class SavedDeskAlreadyExistsHttpException extends BadRequestException {
    constructor() {
        super("Saved desk already exists");
    }
}
