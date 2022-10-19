import { NotFoundException } from "@nestjs/common";

export class DeskNotFoundHttpException extends NotFoundException {
    constructor(public deskId: string) {
        super(`Desk ${deskId} not found`);
    }
}
