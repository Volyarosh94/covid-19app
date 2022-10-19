import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DeskEntity } from "../../desk-service/entity/desk.entity";
import { LocationEntity } from "../../location-service/entity/location.entity";
import { UserEntity } from "../../user-service/entity/user.entity";
import { BookingType } from "../contract/bookingType";
import { BOOKING_STATUS_TYPE } from "./../contract/bookingStatusType";

@Entity("BOOKINGS")
export class BookingEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    user: UserEntity;

    @ManyToOne(() => LocationEntity, { onDelete: "CASCADE" })
    location: LocationEntity;

    @ManyToOne(() => DeskEntity, { onDelete: "CASCADE" })
    desk: DeskEntity;

    @Column("timestamp with time zone")
    dateFrom?: string;

    @Column("timestamp with time zone")
    dateTo?: string;

    @Column("time with time zone", { nullable: true })
    timeFrom?: string;

    @Column("time with time zone", { nullable: true })
    timeTo?: string;

    @Column("char", { length: 3, nullable: true })
    weekDay?: string;

    @Column("boolean", { default: false })
    selected?: boolean;

    @Column("int", { nullable: true })
    index?: number;

    @Column("varchar")
    type: BookingType;

    @Column("boolean", { nullable: true, default: null })
    hasPassedQuestionnaire: boolean;

    @Column("enum", { nullable: false, enum: BOOKING_STATUS_TYPE })
    status: BOOKING_STATUS_TYPE;
}
