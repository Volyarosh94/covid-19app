import { MigrationInterface, QueryRunner } from "typeorm";
import { DeskEntity } from "../desk-service/entity/desk.entity";
import { DrawingType } from "../location-service/contract/floorSchema";
import { FloorSchemaEntity } from "../location-service/entity/floorSchema.entity";

export class UpdateSectionColumnForDeskEntity1628055660458 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        const [desks, floorSchemas] = await Promise.all([
            queryRunner.manager.find(DeskEntity, { relations: ["floor"] }),
            queryRunner.manager.find(FloorSchemaEntity, { relations: ["floor"] })
            // queryRunner.changeColumn(
            //     "DESKS",
            //     "section",
            //     new TableColumn({
            //         name: "section",
            //         type: "varchar",
            //         isNullable: true,
            //         default: null
            //     })
            // )
        ]);

        const updatedDesks = desks.map((desk) => {
            const fSchema = floorSchemas.find((f) => f.floor.id === desk.floor.id);

            if (fSchema) {
                const section = fSchema.schema.drawings.find(
                    (dr) => dr.sectionId && dr.sectionId === desk.sectionId && dr.type === DrawingType.SECTION
                );
                if (section) {
                    desk.section = section.name;
                }
            }
            return desk;
        });

        await queryRunner.manager.save(updatedDesks);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("DESKS", "section");
    }
}
