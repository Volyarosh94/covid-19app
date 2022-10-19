import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DeviceTokenEntity } from "./deviceToken.entity";

@Entity("USERS")
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar")
    email: string;

    @Column("varchar")
    name: string;

    @Column("varchar")
    mobilePhone: string;

    @OneToMany(() => DeviceTokenEntity, (token) => token.user)
    deviceTokens: DeviceTokenEntity[];

    @Column({ type: "varchar", nullable: true })
    location?: string;
}
