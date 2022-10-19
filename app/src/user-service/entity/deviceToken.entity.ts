import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("USER_DEVICE_TOKEN")
export class DeviceTokenEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar")
    deviceToken: string;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    user: UserEntity;
}
