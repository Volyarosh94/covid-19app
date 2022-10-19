import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class SetIsWatchedColumnForNotificationHistoryEntity1626853588719 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "USER_NOTIFICATIONS_HISTORY",
            new TableColumn({
                name: "isWatched",
                type: "boolean",
                default: false
            })
        );
    }
    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("USER_NOTIFICATIONS_HISTORY", "isWatched");
    }
}
