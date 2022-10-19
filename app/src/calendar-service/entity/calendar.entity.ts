import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LocationEntity } from "../../location-service/entity/location.entity";

@Entity("CALENDAR")
export class CalendarEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => LocationEntity, { cascade: ["insert", "update"], onDelete: "CASCADE" })
    location: LocationEntity;

    @Column({ type: "jsonb", array: false })
    disabledDates: Array<string>;
}
