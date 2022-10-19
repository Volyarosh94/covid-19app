import { DeskApproverEntity } from "./deskApprover.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { BookingEntity } from "../../booking-service/entity/booking.entity";
import { LocationFloorEntity } from "../../location-service/entity/locationFloor.entity";
import { DESK_STATUS_TYPE } from "../contract/deskStatusType";
import { DeskResourceEntity } from "./deskResource.entity";

@Entity("DESKS")
export class DeskEntity {
    @PrimaryColumn("uuid")
    id: string;

    @Column("varchar")
    name: string;

    @Column("int", { nullable: true })
    sectionId: number;

    @Column("varchar", { nullable: true })
    section: string;

    @Column("varchar")
    status: DESK_STATUS_TYPE;

    @ManyToOne(() => LocationFloorEntity, (floor) => floor.desks, { onDelete: "CASCADE" })
    floor: LocationFloorEntity;

    @Column("uuid", { nullable: true })
    owner: string;

    @OneToMany(() => DeskResourceEntity, (resource) => resource.desk)
    deskResources?: DeskResourceEntity[];

    @OneToMany(() => BookingEntity, (booking) => booking.desk)
    bookings?: BookingEntity[];

    @OneToMany(() => DeskApproverEntity, (approver) => approver.desk)
    approvers?: DeskApproverEntity[];
}
