import { MigrationInterface, QueryRunner } from "typeorm";
import { UserEntity } from "../user-service/entity/user.entity";

export class ConvertUserEmailsToLowerCase1626852696490 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        const users = await queryRunner.manager.find(UserEntity);
        const updatedUsers = users.map((user) => {
            user.email = user.email.toLowerCase();
            return user;
        });

        await queryRunner.manager.save(updatedUsers);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("USERS", "email");
    }
}
