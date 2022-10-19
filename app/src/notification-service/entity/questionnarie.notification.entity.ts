import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BookingEntity } from "../../booking-service/entity/booking.entity";
import { QuestionnaireNotificationType } from "../contract/questionnaireNotificationType";

@Entity("QUESTIONNARIE_NOTIFICATIONS")
export class QuestionnarieNotificationEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: QuestionnaireNotificationType
    })
    type: QuestionnaireNotificationType;

    @Column("time with time zone", { nullable: false })
    timeToExecuteInLocationTimeZone: string;

    @Column("uuid", { nullable: false })
    bookingId: string;

    @ManyToOne(() => BookingEntity, { onDelete: "CASCADE" })
    booking: BookingEntity;

    @Column("int", { nullable: true })
    remainedTime?: number;

    @Column("boolean")
    isDeleted: boolean;
}
