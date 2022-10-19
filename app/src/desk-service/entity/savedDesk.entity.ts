import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LocationEntity } from "../../location-service/entity/location.entity";
import { LocationFloorEntity } from "../../location-service/entity/locationFloor.entity";
import { DeskEntity } from "./desk.entity";

@Entity("DESKS_SAVED")
export class SavedDeskEntity {
    constructor(part: Partial<SavedDeskEntity>) {
        Object.assign(this, part);
    }

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("uuid")
    userId: string;

    @ManyToOne(() => LocationEntity, { onDelete: "CASCADE" })
    location: LocationEntity;

    @ManyToOne(() => LocationFloorEntity, { onDelete: "CASCADE" })
    floor: LocationFloorEntity;

    @ManyToOne(() => DeskEntity, { onDelete: "CASCADE" })
    desk: DeskEntity;
}
