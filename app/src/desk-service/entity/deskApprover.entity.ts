import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { DeskEntity } from "./desk.entity";

@Entity("DESK_APPROVERS")
export class DeskApproverEntity {
    constructor(part: Partial<DeskApproverEntity>) {
        Object.assign(this, part);
    }
    
    @PrimaryColumn("uuid")
    deskId: string;

    @ManyToOne(() => DeskEntity, { onDelete: "CASCADE" })
    desk: DeskEntity;

    @PrimaryColumn()
    email: string;

    @Column("boolean", { default: false })
    confirmed: boolean;

    @Column()
    sort: number;
}
