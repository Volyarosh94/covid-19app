import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class QuestionnarieNotificationsTable1626964789482 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "QUESTIONNARIE_NOTIFICATIONS",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "timeToExecuteInLocationTimeZone",
                        type: "timestamp",
                        isNullable: false
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: [
                            "sendQuestionnaireReminder",
                            "sendQuestionnaireBasedCancelBookingNotification",
                            "sendQuestionnaireStartNotification"
                        ],
                        enumName: "typeEnum"
                    },
                    {
                        name: "bookingId",
                        type: "uuid",
                        isNullable: false
                    },
                    {
                        name: "remainedTime",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "isDeleted",
                        type: "boolean",
                        default: false
                    }
                ]
            }),
            false
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE QUESTIONNARIE_NOTIFICATIONS");
    }
}
