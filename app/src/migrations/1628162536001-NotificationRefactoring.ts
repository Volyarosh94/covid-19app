import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class NotificationRefactoring1628150065216 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "NOTIFICATIONS",
            new TableColumn({
                name: "timeToExecuteInLocationTimeZone",
                type: "timestamp with time zone",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("NOTIFICATIONS", "timeToExecuteInLocationTimeZone");
    }
}
