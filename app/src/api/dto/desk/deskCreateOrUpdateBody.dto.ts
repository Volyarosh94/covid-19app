import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID
} from "class-validator";
import * as uuid from "uuid";
import { DESK_STATUS_TYPE } from "../../../desk-service/contract/deskStatusType";
import { DeskSchemaBody } from "../location/deskSchemaBody.dto";

export class DeskCreateOrUpdateBody {
    @ApiPropertyOptional({
        example: uuid.v4()
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    id?: string;

    @ApiPropertyOptional({
        example: "Desk 115"
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({
        example: "Section 1"
    })
    @IsOptional()
    @IsNumber()
    section?: string;

    @ApiPropertyOptional({
        example: "1"
    })
    @IsOptional({})
    @IsNumber()
    sectionId?: number;

    @ApiPropertyOptional({
        example: DESK_STATUS_TYPE.AVAILABLE
    })
    @IsOptional()
    @IsEnum(DESK_STATUS_TYPE)
    @IsNotEmpty()
    status?: DESK_STATUS_TYPE;

    @ApiPropertyOptional({
        example: uuid.v4()
    })
    @IsOptional()
    @IsUUID("4")
    owner?: string;

    @ApiPropertyOptional({
        examples: [uuid.v4()]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayNotEmpty()
    resourceIds?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    emails?: string[];

    @ApiProperty()
    @IsNotEmptyObject()
    deskSchema: DeskSchemaBody;
}
