import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { LocationEntity } from "../../location-service/entity/location.entity";

@Entity("COVID_QUESTIONNAIRE_SCHEDULE")
export class CovidQuestionnaireScheduleEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("int")
    startTime: number;

    @Column("int")
    reminderTime: number;

    @Column("int")
    cancellationTime: number;

    @OneToOne(() => LocationEntity, { onDelete: "CASCADE" })
    @JoinColumn()
    location: LocationEntity;

    @Column("boolean")
    isActive: boolean;
}
