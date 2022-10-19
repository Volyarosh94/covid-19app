import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LocationEntity } from "../../location-service/entity/location.entity";

@Entity("RESOURCES")
export class ResourceEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar")
    name: string;

    @ManyToOne(() => LocationEntity, { onDelete: "CASCADE" })
    location: LocationEntity;

    @Column("boolean", { default: true })
    isAvailable: boolean;

    @Column("timestamp with time zone")
    createdAt: Date;
}
