import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { BookingEntity } from "./booking.entity";

@Entity("BOOKING_APPROVALS")
export class BookingApprovalsEntity {
    constructor(part: Partial<BookingApprovalsEntity>) {
        Object.assign(this, part);
    }

    @PrimaryColumn("uuid")
    bookingId: string;

    @ManyToOne(() => BookingEntity, { onDelete: "CASCADE" })
    booking: BookingEntity;

    @PrimaryColumn()
    email: string;

    @Column("boolean", { default: false })
    approved: boolean;
}
