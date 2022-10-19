import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LocationEntity } from "../../location-service/entity/location.entity";
import { NotificationRecipientType } from "../contract/notificationRecipientType";
import { NOTIFICATION_STATUS_TYPE } from "../contract/notificationStatusType";

@Entity("NOTIFICATIONS")
export class NotificationEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar")
    subject: string;

    @Column("varchar")
    message: string;

    @Column("timestamp with time zone", { nullable: true })
    sendDate: Date;

    @ManyToOne(() => LocationEntity)
    location: LocationEntity;

    @Column("varchar")
    status: NOTIFICATION_STATUS_TYPE;

    @Column("varchar")
    recipients: NotificationRecipientType;

    @Column("timestamp with time zone", { nullable: true })
    startDate: Date;

    @Column("timestamp with time zone", { nullable: true })
    endDate: Date;

    @Column("timestamp with time zone")
    createdAt: Date;

    @Column("timestamp with time zone", { nullable: true })
    timeToExecuteInLocationTimeZone: Date;
}
