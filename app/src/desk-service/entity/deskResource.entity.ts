import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ResourceEntity } from "../../resource-service/entity/resource.entity";
import { DeskEntity } from "./desk.entity";

@Entity("DESK_RESOURCES")
export class DeskResourceEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => DeskEntity, { onDelete: "CASCADE" })
    desk: DeskEntity;

    @ManyToOne(() => ResourceEntity, { onDelete: "CASCADE" })
    resource: ResourceEntity;
}
