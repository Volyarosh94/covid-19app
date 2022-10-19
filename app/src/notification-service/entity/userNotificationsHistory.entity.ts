import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../../user-service/entity/user.entity";


@Entity("USER_NOTIFICATIONS_HISTORY")
export class UserNotificationsHistoryEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    user: UserEntity;

    @Column("varchar")
    subject: string;

    @Column("varchar")
    message: string;

    @Column("timestamp with time zone")
    sendDate: Date;

    @Column("boolean", { default: false })
    isWatched: boolean;
}
