import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LocationFloorEntity } from "./locationFloor.entity";

@Entity("FLOOR_MAP")
export class FloorMapEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @ManyToOne(() => LocationFloorEntity, { onDelete: "CASCADE" })
    floor: LocationFloorEntity;
    @Column({ type: "bytea" })
    buffer: Buffer;
    @Column("varchar")
    mimetype: string;
    @Column("varchar")
    encoding: string;
    @Column("varchar")
    fieldname: string;
    @Column("varchar")
    originalname: string;
    @Column("int")
    size: number;
}
