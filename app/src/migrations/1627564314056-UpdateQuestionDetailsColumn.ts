import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { CovidQuestionEntity } from "../covid-question-service/entity/covidQuestion.entity";

export class UpdateQuestionDetailsColumn1627564314056 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        const questions = await queryRunner.manager.find(CovidQuestionEntity);

        await queryRunner.changeColumn(
            "COVID_QUESTIONS",
            "questionDetails",
            new TableColumn({
                name: "questionDetails",
                type: "varchar",
                isNullable: true,
                default: null
            })
        );

        await queryRunner.manager.save(questions);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("COVID_QUESTIONS", "questionDetails");
    }
}
