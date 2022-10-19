import { NotFoundException } from "@nestjs/common";

export class ResourceNotFoundHttpException extends NotFoundException {
    constructor(public resourceId: string) {
        super(`Resource ${resourceId} not found`);
    }
}
