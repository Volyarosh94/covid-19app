import { NotFoundException } from "@nestjs/common";

export class LocationNotFoundHttpException extends NotFoundException {
    constructor(public locationId: string) {
        super(`Location ${locationId} not found`);
    }
}
