import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FloorSchema } from "../contract/floorSchema";
import { LocationFloorEntity } from "./locationFloor.entity";

@Entity("FLOOR_SCHEMA")
export class FloorSchemaEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @ManyToOne(() => LocationFloorEntity, { onDelete: "CASCADE" })
    floor: LocationFloorEntity;
    @Column("jsonb", { array: false })
    schema: FloorSchema;
}
