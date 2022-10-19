import { MigrationInterface, QueryRunner } from "typeorm";
import { DeskEntity } from "../desk-service/entity/desk.entity";

export class AddSectionIdToDeskEntity1628055660458 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.addColumn(
        //     "DESKS",
        //     new TableColumn({
        //         name: "sectionId",
        //         type: "int",
        //         isNullable: true,
        //         default: null
        //     })
        // );
        const desks = await queryRunner.manager.find(DeskEntity);

        const updatedDesks = desks.map((desk) => {
            // in case if you run migration for second time section may be a string
            if (desk.section && !isNaN(Number(desk.section))) {
                desk.sectionId = Number(desk.section);
            }
            return desk;
        });

        await queryRunner.manager.save(updatedDesks);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("DESKS", "section");
    }
}
