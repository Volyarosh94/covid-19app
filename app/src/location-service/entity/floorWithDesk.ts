import { DeskEntity } from "../../desk-service/entity/desk.entity";
import { LocationFloorEntity } from "./locationFloor.entity";

export class FloorEntityWithDesk extends LocationFloorEntity {
    desk: DeskEntity;
}
