import {
    Column,
    Entity, OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { LocationFloorEntity } from "./locationFloor.entity";
import { DeskEntity } from "../../desk-service/entity/desk.entity";



@Entity("LOCATIONS")
export class LocationEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column("varchar")
    locationName: string;
    @Column("varchar")
    locationAddress: string;
    @Column({ type: "varchar", default: "00:00:00 - 24:00:00" })
    businessHours: string;
    @Column({ type:"varchar" })
    country: string;
    @Column({ type:"varchar" })
    city: string;
    @Column({ type:"varchar" })
    region: string;
    @Column( { type:"timestamp with time zone" })
    createdAt?: Date;
    @OneToMany(()=> LocationFloorEntity, (floor)=> floor.location)
    floorsEntity?: LocationFloorEntity[];
    @OneToMany(()=> DeskEntity, (desk)=> desk.floor)
    desksEntity?: DeskEntity[];
    @Column({ type:"varchar", nullable: true } )
    timezone: string;
}


