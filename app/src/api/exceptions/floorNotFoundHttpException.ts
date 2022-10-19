import { NotFoundException } from "@nestjs/common";

export class FloorNotFoundHttpException extends NotFoundException {
    constructor(public floorId: string) {
        super(`Floor ${floorId} not found`);
    }
}
