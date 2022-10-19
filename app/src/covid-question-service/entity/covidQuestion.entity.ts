import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LocationEntity } from "../../location-service/entity/location.entity";

@Entity("COVID_QUESTIONS")
export class CovidQuestionEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar")
    questionText: string;

    @Column("varchar", { nullable: true, default: null })
    questionDetails?: string;

    @Column("boolean", { nullable: false, default: false })
    isPositive: boolean;

    @Column("timestamp with time zone")
    createdAt: Date;

    @ManyToOne(() => LocationEntity, { onDelete: "CASCADE" })
    location: LocationEntity;
}
