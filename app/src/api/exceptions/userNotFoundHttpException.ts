import { NotFoundException } from "@nestjs/common";

export class UserNotFoundHttpException extends NotFoundException {
    constructor(public userId: string) {
        super(`User ${userId} not found`);
    }
}
