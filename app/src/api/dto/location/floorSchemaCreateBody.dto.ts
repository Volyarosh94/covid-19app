import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { DeskCreateOrUpdateBody } from "../desk/deskCreateOrUpdateBody.dto";
import { SectionSchemaBody } from "./sectionSchemaBody.dto";

export class FloorSchemaCreateBody {
    @ApiPropertyOptional({ type: [SectionSchemaBody] })
    @IsOptional()
    sections?: SectionSchemaBody[];

    @ApiPropertyOptional({ type: [DeskCreateOrUpdateBody] })
    @IsOptional()
    desks?: DeskCreateOrUpdateBody[];
}
