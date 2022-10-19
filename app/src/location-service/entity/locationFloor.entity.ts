import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DeskEntity } from "../../desk-service/entity/desk.entity";
import { LocationEntity } from "./location.entity";

@Entity("LOCATION_FLOORS")
export class LocationFloorEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar")
    floorName: string;
    @ManyToOne(() => LocationEntity,  { onDelete: "CASCADE" })
    location: LocationEntity;
    @OneToMany(() => DeskEntity, (desk) => desk.floor)
    desks?: DeskEntity[];
}
